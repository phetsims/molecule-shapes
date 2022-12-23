# Model Notes for Molecule Shapes / Molecule Shapes: Basics

Helpful reading: http://en.wikipedia.org/wiki/VSEPR_theory

## For the "Model" views:

For each steric number (bond + lone pair count), we have ideal orientations for each "electron pair", ordered so that
we can fill the higher-repulsion slots first.
For example, with a steric number of 5 (geometry is trigonal bipyramidal), there are five orientations, and conceptually
we order them "radial 1", "radial 2", "radial 3", "axial 1" and "axial 2". We start filling slots with lone pairs
(which have the highest repulsion), then fill the rest in with any order of single/double/triple bonds (currently the
single/double/triple bonds act identically as requested). For example, with 2 lone electron pairs, 1 single bond and
2 double bonds, the lone pairs can be matched with a combination of "radial 1" and "radial 2", and all 3 of the bonds
can be matched with any combination of "radial 3", "axial 1" and "axial 2" resulting in the T-shaped molecular
geometry.

## For the "Real" views:

Data is pulled from a mix of PubChem and/or reconstructed from the best known bond angles. Lone pairs and bonds can
only be matched with the same type (single and double bonds can't switch places). Currently outer lone pairs interact
only locally around their atom, not with lone pairs connected to other atoms.

## Animation effects:

The model is fundamentally variable-timestep, except for very large timesteps that otherwise wouldn't result in a
stable configuration.

It also is tuned to provide quick guaranteed convergence to the correct geometry, and to provide a feeling of
"repulsion" between atoms/lone-pairs (that would result in the VSEPR geometry). The actual animation is not
"physically realistic" by any means, as we are already working with a simplified model, AND it has to avoid
locally-stable configurations (with Coulomb repulsion) that do not minimize the global energy.

Lone pairs and atoms (when added) quickly approach the proper distance to the central atom. From then on, they will
always maintain that distance, essentially as a point moving along a fixed sphere.

The moving behavior of the atoms and lone pairs is a dynamic balance between the following:

- A damped-spring-like system is used to attract to the correct distance from the central atom.
- Velocity tangent to the sphere is stored and stepped each frame. Damping is applied for stability.
- Coulomb-like pair-wise repulsion forces are applied to radial "Model" atoms and lone pairs, reduced in amount
  when near an ideal configuration.
- An attractive force is applied to radial "Model" atoms and lone pairs that pushes directly towards the closest ideal
  configuration. Both velocity and position are directly changed for faster convergence, and lone pairs experience
  more attraction.
- An attractive pair-wise force is applied to "Real" atoms and lone pairs that pushes bond angles towards the closest
  ideal configuration (not based on target positions, but instead bond angles). This is also applied to outer lone pairs.

The last two effects require that we know:
1. A 3D rotation of our "ideal" configuration to best match our "current" configuration.
2. Which atom/lone-pair matches which "ideal" orientation.
This is computed every frame, via an SVD-based linear regression for every possible permutation of atoms and lone pairs
that the model allows. Thus we know the "current" position of each atom/lone-pair, and the closest "ideal" position.