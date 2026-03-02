greetings and welcome to my phong shader lit world 💡

꩜ overview:
- phong shading: all objects in the world are lit using phong shading (ambient + diffuse + specular)
- point light: orbits the world automatically, position also controllable with a slider
- spotlight: fixed above the center of the world pointing down
- light marker cubes: a yellow cube marks the point light and a purple cube marks the spotlight
- light color picker: to change the color of the point light with a color picker. added reset button to go back to white
- normal visualization: toggle button to switch between regular color and raw normal vectors as colors
- individual light toggles: point light and spotlight can each be turned on/off independently
- OBJ model: a burger loaded from a .obj file, this is the obj file from one of the earlier labs that we did
- crab: one large blocky crab from asgn2/asgn3 is next to the sphere, facing the camera at any angle
- pink sphere: placed at center of world, good for seeing lighting effects on a curved surface
- minecraft functionality: kept this just because, can add and remove blocks like prev assignment. 

꩜ some notes and comment:
For this assignment I built off of my asgn3 code, keeping the world structure and crab from before. To make things easier, I only kept the outer walls from my blocky world and got rid of the find the crab game, replacing it with one blocky crab in the middle of this assignment. I started by watching the lighting helper videos,and then moved into the extra requirements on my own. The trickiest part was getting the normals to actually work, I ran into an issue with transpose() and inverse() not being available in WebGL 1.0 GLS. For the obj, I used a burger model that I made during Lab 0 in this class. 