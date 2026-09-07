"""Convert the copied, licensed Mac512k FBX into an editable blend and web GLB.

Run from anywhere with Blender 5.2:
  blender --background --python assets/tools/prepare_macintosh.py

Originals are read only. Source .blend keeps all imported meshes and 4K maps.
Web output merges static pieces without reducing geometry, uses 2K base colors
and 1K data maps, and gives the curved CRT normalized UVs for application content.
"""
import json
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/source/macintosh-512k/original'
WORK = ROOT / 'assets/source/macintosh-512k/work'
OUT = ROOT / 'frontend/public/models'
TEXTURES = SOURCE / 'Textures/Textures'
for directory in (WORK, WORK / 'textures-2k', OUT):
    directory.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(SOURCE / 'Mac512k.fbx'), use_image_search=False)
objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
original_mesh_names = [obj.name for obj in objects]

def image_node(material, name, color=False):
    image = bpy.data.images.load(str(TEXTURES / name), check_existing=True)
    image.colorspace_settings.name = 'sRGB' if color else 'Non-Color'
    node = material.node_tree.nodes.new('ShaderNodeTexImage')
    node.name = name.rsplit('.', 1)[0]
    node.image = image
    return node

occlusion_group = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
occlusion_group.interface.new_socket(name='Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
occlusion_group.nodes.new('NodeGroupInput')

def pbr_material(prefix):
    material = bpy.data.materials.new('Macintosh_' + prefix)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['IOR'].default_value = 1.46
    links = material.node_tree.links
    for suffix, target in [('BaseColor', 'Base Color'), ('Roughness', 'Roughness'), ('Metallic', 'Metallic')]:
        node = image_node(material, f'Mac512k_{prefix}_{suffix}.png', color=suffix == 'BaseColor')
        links.new(node.outputs['Color'], bsdf.inputs[target])
    normal_image = image_node(material, f'Mac512k_{prefix}_Normal.png')
    normal = material.node_tree.nodes.new('ShaderNodeNormalMap')
    links.new(normal_image.outputs['Color'], normal.inputs['Color'])
    links.new(normal.outputs['Normal'], bsdf.inputs['Normal'])
    ao_image = image_node(material, f'Mac512k_{prefix}_AO.png')
    ao = material.node_tree.nodes.new('ShaderNodeGroup')
    ao.node_tree = occlusion_group
    links.new(ao_image.outputs['Color'], ao.inputs['Occlusion'])
    return material

body_material = pbr_material('Body')
peripheral_material = pbr_material('KeyboardMouse')
body_names = {'Body.001', 'BrightnessKnob', 'BackPowerButton', 'Screen'}
for obj in objects:
    obj.data.materials.clear()
    obj.data.materials.append(body_material if obj.name in body_names else peripheral_material)

# Source blend: full original resolution, original piece separation and UVs.
# Pack maps so this editable working file is self-contained without relocating originals.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(WORK / 'macintosh-512k-source.blend'))

# Imported FBX groups carry its Y-up to Blender Z-up conversion. Bake that
# hierarchy only in the web derivative so mesh coordinates and UV axes agree.
for obj in objects:
    world = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = world
for obj in list(bpy.context.scene.objects):
    if obj.type == 'EMPTY':
        bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

for material in (body_material, peripheral_material):
    for node in material.node_tree.nodes:
        if node.type != 'TEX_IMAGE':
            continue
        source_image = node.image
        web_image = source_image.copy()
        web_image.name = source_image.name + '_web2k'
        width, height = source_image.size
        is_color = 'BaseColor' in source_image.name
        limit = 2048 if is_color else 1024
        ratio = min(1.0, limit / max(width, height))
        web_image.scale(round(width * ratio), round(height * ratio))
        extension = '.jpg' if is_color else '.png'
        web_image.file_format = 'JPEG' if is_color else 'PNG'
        web_image.filepath_raw = str(WORK / 'textures-2k' / (Path(source_image.name).stem + extension))
        # save() respects the image format; 2K derivations stay outside the original directory.
        web_image.save()
        # A freshly loaded derivative avoids glTF reusing packed 4K source bytes.
        node.image = bpy.data.images.load(web_image.filepath_raw, check_existing=False)
        node.image.colorspace_settings.name = 'sRGB' if is_color else 'Non-Color'

screen = bpy.data.objects['Screen']
screen_material = bpy.data.materials.new('CRT_Glass')
screen_material.use_nodes = True
screen_bsdf = screen_material.node_tree.nodes.get('Principled BSDF')
screen_bsdf.inputs['Base Color'].default_value = (0.018, 0.028, 0.023, 1)
screen_bsdf.inputs['Roughness'].default_value = 0.22
screen_bsdf.inputs['Metallic'].default_value = 0
screen_bsdf.inputs['IOR'].default_value = 1.5
screen.data.materials.clear()
screen.data.materials.append(screen_material)
screen_uv = screen.data.uv_layers.active
xs = [v.co.x for v in screen.data.vertices]
zs = [v.co.z for v in screen.data.vertices]
for polygon in screen.data.polygons:
    polygon.use_smooth = True
    for loop_index in polygon.loop_indices:
        position = screen.data.vertices[screen.data.loops[loop_index].vertex_index].co
        screen_uv.data[loop_index].uv = ((position.x - min(xs)) / (max(xs) - min(xs)),
                                       (position.z - min(zs)) / (max(zs) - min(zs)))

def join_objects(names, result_name):
    bpy.ops.object.select_all(action='DESELECT')
    selected = [bpy.data.objects[name] for name in names]
    for obj in selected:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = selected[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = result_name
    obj.data.name = result_name + '_Geometry'
    return obj

body = join_objects(['Body.001', 'BrightnessKnob', 'BackPowerButton'], 'MacintoshBody')
mouse = join_objects(['MouseBody', 'MouseButton'], 'Mouse')
keyboard_names = [name for name in original_mesh_names if name not in body_names and name not in {'MouseBody', 'MouseButton'}]
keyboard = join_objects(keyboard_names, 'Keyboard')
web_meshes = [body, keyboard, mouse, screen]

metadata = {'coordinate_system': 'glTF Y-up, meters, front +Z', 'source_mesh_count': len(original_mesh_names),
    'optimization': 'No mesh decimation. Static parts joined into four meshes; base color 2048px JPEG, normal and ORM 1024px lossless PNG.', 'meshes': []}
all_points = []
for obj in web_meshes:
    obj.data.calc_loop_triangles()
    points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    points = [Vector((v.x, v.z, -v.y)) for v in points]
    all_points.extend(points)
    bounds = [[min(v[i] for v in points) for i in range(3)], [max(v[i] for v in points) for i in range(3)]]
    metadata['meshes'].append({'name': obj.name, 'vertices': len(obj.data.vertices), 'triangles': len(obj.data.loop_triangles),
                              'bounds': bounds, 'materials': [m.name for m in obj.data.materials]})
metadata['bounds'] = [[min(v[i] for v in all_points) for i in range(3)], [max(v[i] for v in all_points) for i in range(3)]]
normals = [polygon.normal for polygon in screen.data.polygons]
average = sum(normals, Vector()) / len(normals)
metadata['screen'] = {'name': 'Screen', 'material': 'CRT_Glass', 'normal': [average.x, average.z, -average.y],
                      'uv': 'Normalized projection: U increases model X, V increases model Y; texture.flipY=false for Three GLTFLoader replacement map.'}

bpy.ops.object.select_all(action='DESELECT')
for obj in web_meshes:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT / 'macintosh-512k.next.glb'), export_format='GLB', use_selection=True,
    export_animations=False, export_cameras=False, export_lights=False, export_yup=True,
    export_image_format='AUTO', export_jpeg_quality=92, export_image_quality=92,
    export_normals=True, export_texcoords=True, export_tangents=False, export_extras=True)
(OUT / 'macintosh-512k.next.glb').replace(OUT / 'macintosh-512k.glb')
metadata['glb_bytes'] = (OUT / 'macintosh-512k.glb').stat().st_size
(WORK / 'metadata.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
print('MAC_METADATA ' + json.dumps(metadata))

# A neutral studio render verifies actual texture placement and silhouette.
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 40
scene.cycles.use_denoising = True
scene.render.resolution_x = 1200
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.world = bpy.data.worlds.new('MacintoshStudioWorld')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.12, 0.14, 0.19, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
scene.view_settings.view_transform = 'AgX'

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.camera_add(location=(0.69, -1.1, 0.56))
camera = bpy.context.object
camera.data.lens = 64
aim(camera, (0.035, -0.09, 0.13))
scene.camera = camera
for name, location, energy, color, size in [
    ('Key', (-0.55, -0.55, 0.85), 42, (1.0, 0.88, 0.71), 0.6),
    ('Fill', (0.65, -0.4, 0.35), 13, (0.69, 0.77, 1.0), 0.5),
    ('Rim', (0.2, 0.55, 0.7), 38, (0.76, 0.81, 1.0), 0.4),
]:
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.shape = 'DISK'
    light.data.size = size
    aim(light, (0, -0.04, 0.13))
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.0025))
floor = bpy.context.object
floor.name = 'StudioFloor'
floor_mat = bpy.data.materials.new('StudioFloor')
floor_mat.diffuse_color = (0.022, 0.026, 0.035, 1)
floor.data.materials.append(floor_mat)
scene.render.filepath = str(WORK / 'macintosh-512k-material-check.png')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK / 'macintosh-512k-web-preview.blend'))
bpy.ops.render.render(write_still=True)
