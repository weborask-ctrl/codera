"""Rebuild the final study locally in Blender 5.2.
blender --background --python scripts/create-octopus-blender.py -- --output assets/blender/octopus
"""
from pathlib import Path
import sys, bpy

scripts=Path(__file__).resolve().parent
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if '--output' not in args:
    raise SystemExit('Pass -- --output <directory>')
out=Path(args[args.index('--output')+1]).resolve()
out.mkdir(parents=True,exist_ok=True)
scope={'__name__':'__main__'}
build=(scripts/'build-octopus-blender.py').read_text(encoding='utf-8')
exec(compile(build.split("if 'artifacts' in globals():")[0],str(scripts/'build-octopus-blender.py'),'exec'),scope)
exec(compile((scripts/'refine-octopus-blender.py').read_text(encoding='utf-8'),str(scripts/'refine-octopus-blender.py'),'exec'),scope)
exec(compile((scripts/'blend-octopus-crown.py').read_text(encoding='utf-8'),str(scripts/'blend-octopus-crown.py'),'exec'),scope)
exec(compile((scripts/'check-octopus-crown-weights.py').read_text(encoding='utf-8'),str(scripts/'check-octopus-crown-weights.py'),'exec'),scope)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'codera-octopus-rig.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(out/'codera-octopus-rig.glb'),export_format='GLB')
scene=bpy.context.scene
scene.render.filepath=str(out/'octopus-crown-front.png')
bpy.ops.render.render(write_still=True)
