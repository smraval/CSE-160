greetings and welcome to my three.js park picnic 🧺

꩜ overview:
- sunny park scene with a picnic blanket, food, trees, a bench, flowers, a fountain, and sky lanterns
- light control panel (bottom right): toggle each of the 5 light sources on/off individually
- sunset mode checkbox: swaps the sky to a sunset texture, turns off the sun, and shifts the lanterns to warm sunset colors

꩜ requirements covered:
- 20+ primary 3D shapes: boxes, spheres, cylinders, cones, toruses, planes used across picnic items, trees, bench, fountain, lamp post, flowers, bushes, and lanterns
- textures: grass ground, picnic blanket, stone path, fountain structure, and skybox all use image textures
- animation: 8 sky lanterns float and sway continuously, fountain spray pulses up and down
- 3D models: burger_colored.obj (with .mtl and shaded.png texture) on the picnic blanket, Lowpoly_tree_sample.obj (with .mtl) scattered across the park
- lights: Directional (sun), Ambient, Hemisphere, Point (lamp post), Spot (sunbeam) — all toggleable
- skybox: large sphere with sky.jpg mapped to the inside, swappable to sunset.jpg
- perspective camera with OrbitControls

꩜ wow point (i hope):
the sky lanterns are the wow point — 8 individually animated lanterns float above the picnic scene, each drifting and rotating at slightly different speeds and phases. when sunset mode is activated, all lanterns shift from their default warm yellows and oranges to deep sunset reds and purples in sync with the sky change.

꩜ some notes:
this was built entirely in Three.js using ES modules, split across 11 files. the modular structure made it a lot easier to manage as the scene grew. I have experience with three.js through my research projects, so I tried to follow the directions and standards outlined in the instructions properly. but I may have done some things with different conventions due to having learned it before. 
