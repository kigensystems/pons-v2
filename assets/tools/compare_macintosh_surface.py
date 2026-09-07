"""Render controlled material/surface studies from the web derivative only."""
from pathlib import Path
import json
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'assets/source/macintosh-512k/work'
bpy.ops.wm.open_mainfile(filepath=str(WORK / 'macintosh-512k-web-preview.blend'))
scene = bpy.context.scene
mode = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'baseline'
scene.cycles.samples = 48
scene.render.resolution_x = 1536
scene.render.resolution_y = 1024
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.055, 0.08, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
scene.view_settings.exposure = -0.25
scene.view_settings.view_transform = 'AgX'

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()

scene.camera.location = (0.48, -1.34, 0.49)
scene.camera.data.lens = 66
aim(scene.camera, (0.055, -0.09, 0.14))
for name, location, energy, color, size in [
    ('Key', (-0.45, -0.6, 0.65), 25, (1.0, 0.79, 0.49), 0.4),
    ('Fill', (0.25, -0.7, 0.38), 2, (0.70, 0.75, 1.0), 0.5),
    ('Rim', (0.55, 0.08, 0.65), 20, (0.47, 0.39, 1.0), 0.4),
]:
    light = bpy.data.objects[name]
    light.location = location
    light.data.energy = energy
    light.data.color = color
    light.data.size = size
    aim(light, (0, -0.04, 0.13))
floor = bpy.data.materials['StudioFloor']
floor.use_nodes = True
floor.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.012, 0.009, 0.012, 1)
floor.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.38

print('SURFACE ' + json.dumps([{'name': obj.name, 'smooth': sum(p.use_smooth for p in obj.data.polygons),
    'polygons': len(obj.data.polygons), 'has_custom_normals': obj.data.has_custom_normals} for obj in bpy.data.objects if obj.type == 'MESH']))
if mode == 'glass':
    glass = bpy.data.materials['CRT_Glass'].node_tree.nodes['Principled BSDF']
    glass.inputs['Base Color'].default_value = (0.005, 0.009, 0.012, 1)
    glass.inputs['Roughness'].default_value = 0.14
    glass.inputs['Coat Weight'].default_value = 0.25
    glass.inputs['Coat Roughness'].default_value = 0.12
    bpy.ops.object.light_add(type='AREA', location=(-0.33, -0.73, 0.36))
    light = bpy.context.object
    light.name = 'ScreenSoftbox'
    light.data.energy = 6
    light.data.color = (0.86, 0.92, 1.0)
    light.data.shape = 'DISK'
    light.data.size = 0.22
    aim(light, (0, -0.16, 0.22))
elif mode == 'grain':
    for name in ['Macintosh_Body', 'Macintosh_KeyboardMouse']:
        material = bpy.data.materials[name]
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        bsdf = nodes.get('Principled BSDF')
        normal = bsdf.inputs['Normal'].links[0].from_node
        geometry = nodes.new('ShaderNodeNewGeometry')
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 2200
        noise.inputs['Detail'].default_value = 2
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Distance'].default_value = 0.000025
        bump.inputs['Strength'].default_value = 0.45
        links.new(geometry.outputs['Position'], noise.inputs['Vector'])
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(normal.outputs['Normal'], bump.inputs['Normal'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        rough_image = bsdf.inputs['Roughness'].links[0].from_node
        rough = nodes.new('ShaderNodeMath')
        rough.operation = 'MULTIPLY'
        rough.inputs[1].default_value = 0.78
        links.new(rough_image.outputs['Color'], rough.inputs[0])
        links.new(rough.outputs[0], bsdf.inputs['Roughness'])
elif mode == 'normal-4k':
    for name, texture_name in [('Macintosh_Body', 'Mac512k_Body_Normal.png'), ('Macintosh_KeyboardMouse', 'Mac512k_KeyboardMouse_Normal.png')]:
        material = bpy.data.materials[name]
        node = next(node for node in material.node_tree.nodes if node.type == 'NORMAL_MAP')
        image_node = node.inputs['Color'].links[0].from_node
        image_node.image = bpy.data.images.load(str(WORK.parent / 'original/Textures/Textures' / texture_name), check_existing=False)
        image_node.image.colorspace_settings.name = 'Non-Color'
elif mode == 'bevel':
    for name in ['MacintoshBody', 'Keyboard', 'Mouse']:
        obj = bpy.data.objects[name]
        modifier = obj.modifiers.new('WebMicroBevel', 'BEVEL')
        modifier.width = 0.00035
        modifier.segments = 2
        modifier.limit_method = 'ANGLE'
        modifier.angle_limit = 0.5
        modifier.harden_normals = True
elif mode == 'normal-flip':
    for name in ['Macintosh_Body', 'Macintosh_KeyboardMouse']:
        material = bpy.data.materials[name]
        node = next(node for node in material.node_tree.nodes if node.type == 'NORMAL_MAP')
        image_node = node.inputs['Color'].links[0].from_node
        separate = material.node_tree.nodes.new('ShaderNodeSeparateColor')
        combine = material.node_tree.nodes.new('ShaderNodeCombineColor')
        invert = material.node_tree.nodes.new('ShaderNodeMath')
        invert.operation = 'SUBTRACT'
        invert.inputs[0].default_value = 1
        links = material.node_tree.links
        links.new(image_node.outputs['Color'], separate.inputs['Color'])
        links.new(separate.outputs['Red'], combine.inputs['Red'])
        links.new(separate.outputs['Green'], invert.inputs[1])
        links.new(invert.outputs[0], combine.inputs['Green'])
        links.new(separate.outputs['Blue'], combine.inputs['Blue'])
        links.new(combine.outputs['Color'], node.inputs['Color'])

scene.render.filepath = str(WORK / f'macintosh-surface-{mode}.png')
bpy.ops.render.render(write_still=True)
