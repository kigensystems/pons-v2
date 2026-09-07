"""Read-only asset inspection, run with Blender --background --python."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/source/macintosh-512k/original'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(SOURCE / 'Mac512k.fbx'), use_image_search=False)
meshes = []
for obj in bpy.data.objects:
    if obj.type != 'MESH':
        continue
    points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    obj.data.calc_loop_triangles()
    meshes.append(dict(name=obj.name, vertices=len(obj.data.vertices), tris=len(obj.data.loop_triangles),
        bounds=[[min(v[i] for v in points) for i in range(3)], [max(v[i] for v in points) for i in range(3)]],
        materials=[s.material.name if s.material else None for s in obj.material_slots],
        location=list(obj.location), rotation=list(obj.rotation_euler), scale=list(obj.scale)))
print('MAC_INSPECT ' + json.dumps(meshes))
print('MAC_MATERIALS ' + json.dumps([{'name': m.name, 'nodes': [{'name': n.name, 'type': n.type, 'image': n.image.filepath if n.type == 'TEX_IMAGE' and n.image else None} for n in m.node_tree.nodes]} for m in bpy.data.materials]))
