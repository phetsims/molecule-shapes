# Implementation Notes for Molecule Shapes / Molecule Shapes: Basics

## Porting history:

- from Java (JMonkeyEngine, high-level multi-threaded)
- => Java (LWJGL, low-level multi-threaded)
- => JS (WebGL + proto-phet-core w/o underscore/lodash, low-level single-threaded)
- => JS (three.js + Axon/etc., high-level single-threaded)

## Notable directory structure:

- assets/ - Original lone-pair geometry files, and converted .js files for three.js (see balloon-README.txt)
- images/ - Left as a stub. There are no images.
- js/common/ - Code common to both screens (almost everything)
- js/common/data/ - Raw data in .js files, so it can be plugged into require.js
- js/common/model/ - The model
- js/common/view/3d/ - three.js based view code
- js/common/view/ - Other view code
- js/model/ - All files specific to the "Model" tab
- js/real/ - All files specific to the "Real Molecules" tab
- js/molecule-shapes-dev-{config,main}.js - Config and main to load the sim code without running the sim. Useful for the unit tests and playground.
- tests/playground.html - Loads require.js modules into the global namespace without running the sim (for manual testing)

## Libraries used:

- Standard PhET libraries
- Nitroglycerin (PhET) - for chemistry utilities
- three.js (3rd party) - for accelerated 3D display

## Naming conventions:

Files:
*View - Extends THREE.Object3D (three.js's equivalent of Node), except for *ScreenView which is a Node (following
        PhET conventions).

## Terminology:

- Atom: Either a real atom (has an element, in the Real views), or a generic atom (no element associated, in the Model views)
- Lone Pair: A pair of electrons not bound to an atom (represented as a cloud)
- Pair Group: Either an atom or a lone pair (both of which consist of one or more pairs of involved electrons).
          NOTE: 'electron pair' wouldn't be accurate, since we use one PairGroup to represent an atom with a triple bond.
- VSEPR: The idealized "model" used for the sim, see http://en.wikipedia.org/wiki/VSEPR_theory and the AXE method
- Bond: We use bonds as connections between pair groups (it can represent the connection between an atom and a lone electron pair)
- Orientation: Generally a normalized (unit) vector, significant for pointing in a certain direction
- Geometry Configuration: An arrangements of physical orientations that would occur with the VSEPR model (ignoring atoms vs lone pairs)
- VSEPR Configuration: A geometry configuration, but taking into account how lone pairs affect the atom shape.
- "Real": Angles not based on the VSEPR model, but instead based on observed data.
- Bond Angle: The angle between two bonds (to atoms)

## Overall view structure:

Three layers:
- 3D scene with three.js (bottom)
- 2D overlay with three.js (middle)
- 2D user interface with Scenery (top)

Can render with WebGL when supported, but falls back to Canvas if necessary (flag in MoleculeShapesGlobals)

## three.js and overview of usage:

For development, very general knowledge of OpenGL ES 2.0 and GLSL is assumed in some places (custom shaders, geometry,
use of UV coordinates and other odds and ends) that are specific to WebGL, but is not generally necessary for most code.

A Renderer is responsible for the Canvas/WebGL output to a single <canvas>, and both a Scene and a Camera are needed
to render. The Scene is a tree setup somewhat similarly to Scenery/Piccolo2D, with Object3D being the base type for
nodes in the tree. Like Scenery, every Object3D is a container and has a transform, by default calculated from
.position, .quaternion, and .scale (with wrappers in place for .rotation) as of r68 (current three.js version).

The scene is rendered mainly in two passes, the first for opaque objects, and the second for transparent objects.

three.js includes linear-algebra math (vectors, matrices) which require conversion between other formats. Notably:
new THREE.Vector3().copy( dotVector3 ) // creates a new THREE.Vector3 with the value of dotVector3 (copy() is different!)
new Vector3( 0, 0, 0 ).set( threeVector3 ) // creates a new phet.dot.Vector3 with the value of the THREE.Vector3.

We mainly use THREE.Mesh (combining a THREE.Material and THREE.Geometry) for our displayed objects. A Geometry is a
collection of information, of which we only use vertices, faces, and sometimes UV coordinates. A Material basically
determines the shader used to display the geometry, and sometimes we use ShaderMaterial to manually specify GLSL
shaders to achieve the desired performance (with fallbacks for Canvas-only operation).

Notably, geometries, materials and meshes cannot be shared between renderers (i.e. shared between screens). Thus,
we have various convenience types to help us get geometries/materials/etc. that are local for each Renderer (like
ThreadLocal in Java, but for renderers instead of threads). This way, we don't incur the memory/performance costs of
having everything duplicated for every instance, but still have unique copies of things for every renderer.
Instances of these types are documented as 'renderer-local access' throughout the code.

We currently use class extension with three.js types, making note to not override their variables. It's been lower overhead
for development (and easier to read), however increases the risk of breaks for future three.js releases.

## Coordinate frames:

### Model coordinate frame

Everything in the model is basically here. Bond lengths for real molecules are currently
up-scaled, so a model unit is currently equivalent to 5.5 angstroms. The model hasn't yet been
converted to SI or angstroms due to the difficulty in moving over the manually tuned balance
of forces over to it.
Notably, we use this coordinate frame for all 3D view types under the MoleculeView

### World coordinate frame

Three.js' world coordinate frame, which still maintains the same scale and origin as the
model coordinate frame, but has an applied 3D rotation of the molecule caused by the user's
actions (the MoleculeView is rotated).

### Normalized device coordinates

OpenGL concept, it's the coordinate frame after the projection matrix and perspective
has been applied. It's specific to the Canvas being rendered, with x and y in the range
[-1,1]. Mainly used between transformations of the world and screen coordinate frames

### Screen coordinate frame

In CSS pixels, with 0,0 at the upper-left of the sim where the Canvas starts. We don't apply
the isometric scaling here (it's in the projection matrix of the Camera). Recall that
retina-like devices fit more pixels into one CSS pixel, so it's not a 1-to-1 mapping for pixels.

## Colors:

This sim handles color properties using ProfileColorProperty, and updates so that we can have the interactive color
editor (molecule-shapes-colors.html), and switch between color schemes.

## Canvas fallback:

Handled normally by three.js, but we have a few other conditionals on WebGL support.
- We reduce quality (triangle count) for Canvas fallback, due to its lowered performance
- We increase overdraw to cover up gaps in the Canvas rendering
- We use LabelFallbackNode instead of LabelWebGLView to render bond-angle labels. This will use SVG (Scenery) instead of an
  accelerated WebGL handling for updating text.
- We use BondAngleFallbackView instead of BondAngleWebGLView, which is written in vanilla three.js (without a
  custom shader using ShaderMaterial), but requires more CPU computation and shipping more vertices to the GPU
  (basically, it's slower).