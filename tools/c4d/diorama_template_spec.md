# RVA3D diorama template 002 specification

## Purpose and scope

Template 002 is the canonical Cinema 4D authoring setup for one face/world of
the RVA3D impossible diorama cube. Every world is authored as though it were
the front face. The website will later instantiate and orient six independently
authored exports around a master cube; that website assembly is outside the
scope of this tool.

The corrected convention prioritizes intuitive Cinema 4D authoring: a default
Text spline at the portal plane reads normally through the zero-rotation
preview camera. Three.js will normalize and rotate each complete exported face
assembly later.

Production `.c4d` files live outside the repository. Only the lightweight
generator and its technical documentation are versioned here. Optimized GLBs
will eventually live under `public/models/impossible_cube/`; no placeholder
GLBs are created by the generator.

## Coordinate and dimensional contract

- Document unit: centimeters
- Viewing-face center: `(0, 0, 0)`
- Viewer/camera side: `-Z`
- Outward normal: `-Z`
- Diorama/world depth: `+Z`
- Outer face: `200 x 200 cm`
- Physical cube bounds: `X=-100..100`, `Y=-100..100`, `Z=0..+200`
- Physical cube center: `(0, 0, +100)`
- Portal opening: `180 x 180 cm`, centered on the origin
- Safe area: `160 x 160 cm`, centered within the opening
- Default frame border: `10 cm`
- Default frame depth: `8 cm`, from `Z=0` through `Z=+8`
- Portal mesh plane: exactly `Z=0`

All geometry dimensions are encoded directly in polygon point coordinates.
The export roots and generated exportable objects therefore retain zero
position, rotation, and unit scale.

## Stable hierarchy and naming contract

> **Warning:** `EXPORT_ROOT`, `FRAME`, `PORTAL_APERTURE`, and `WORLD` are exact,
> case-sensitive integration names. The three immediate children of
> `EXPORT_ROOT` must remain exactly `FRAME`, `PORTAL_APERTURE`, and `WORLD`.
> Future Three.js code will depend on this contract. Do not rename them or add
> another wrapper between them and `EXPORT_ROOT` without coordinating a web
> implementation change.

Expected generated hierarchy:

```text
EXPORT_ROOT
|-- FRAME
|   |-- FRAME_TOP
|   |-- FRAME_BOTTOM
|   |-- FRAME_LEFT
|   `-- FRAME_RIGHT
|-- PORTAL_APERTURE
`-- WORLD
    |-- STATIC
    |-- ANIMATED
    `-- PHYSICS

_GUIDES
|-- GUIDE_CUBE
|-- GUIDE_SAFE_AREA
|-- GUIDE_DEPTH
|   |-- DEPTH_PORTAL_Z_000
|   |-- DEPTH_CUBE_BACK_Z_POS_200
|   |-- DEPTH_DEEP_Z_POS_500
|   |-- DEPTH_EXTREME_Z_POS_1000
|   `-- ORIENTATION_REFERENCE_DEFAULT_TEXT
|-- PORTAL_TARGET
`-- PORTAL_PREVIEW_CAMERA
```

`EXPORT_ROOT` and `_GUIDES` are siblings. `_GUIDES` must never be parented
under `EXPORT_ROOT`, and only `EXPORT_ROOT` should be selected for a production
world export.

## Geometry definitions

### Placeholder frame

The placeholder frame consists of four six-quad boxes:

| Object | X bounds | Y bounds | Z bounds | Size |
| --- | ---: | ---: | ---: | ---: |
| `FRAME_TOP` | `-100..100` | `90..100` | `0..8` | `200 x 10 x 8 cm` |
| `FRAME_BOTTOM` | `-100..100` | `-100..-90` | `0..8` | `200 x 10 x 8 cm` |
| `FRAME_LEFT` | `-100..-90` | `-90..90` | `0..8` | `10 x 180 x 8 cm` |
| `FRAME_RIGHT` | `90..100` | `-90..90` | `0..8` | `10 x 180 x 8 cm` |

These bounds produce an exact `200 x 200 cm` outside boundary and an exact
`180 x 180 cm` unobstructed opening. The frame does not protrude toward the
viewer into `-Z`.

### Portal aperture

`PORTAL_APERTURE` is one quad with four points, no subdivision, dimensions
`180 x 180 cm`, centered at `Z=0`, and a `-Z` normal toward the preview camera.
Its generated preview material is only an
authoring aid. The website may replace or override that material with Drei's
`MeshPortalMaterial`.

### World organization

Scenery visible only through the portal belongs beneath `WORLD`, normally in
`STATIC`, `ANIMATED`, or `PHYSICS`. Such scenery should generally remain at
`Z >= 0`.

Geometry intentionally protruding physically in front of the portal is
exterior/foreground geometry. It should generally belong with `FRAME`, not
`WORLD`, so its role remains explicit during assembly and interaction work.

## Modeling guides

All guide objects are editor-only and live outside the export hierarchy.

- `GUIDE_CUBE` is a 12-edge wire cube spanning exactly `X=-100..100`,
  `Y=-100..100`, and `Z=0..+200`.
- `GUIDE_SAFE_AREA` outlines `160 x 160 cm` immediately outside the portal
  plane so it remains legible as an editor overlay.
- `GUIDE_DEPTH` contains portal-sized outlines at `Z=0`, `Z=+200`, `Z=+500`,
  and `Z=+1000` to expose physically impossible world depth while modeling.
- `GUIDE_DEPTH/ORIENTATION_REFERENCE_DEFAULT_TEXT` is an editor-only Text
  spline at `Z=0`. Its transform remains at default position, zero rotation,
  and unit scale. `RVA3D FRONT` should read normally through the preview camera;
  it is a disposable orientation check and must not export.
- `PORTAL_TARGET` begins at `(0, 0, +100)` as a visual centerline reference.
- `PORTAL_PREVIEW_CAMERA` begins at `(0, 0, -350)` with explicit H/P/B rotation
  `(0, 0, 0)`, a perspective projection, a `50 mm` focal length, and a `36 mm`
  film gate. It looks through the portal toward `+Z` without a Target
  Expression or target-object link.
- The generated document uses a square `1000 x 1000 px` preview output. At the
  portal plane, the camera's square view spans approximately `252 x 252 cm`,
  keeping the full `200 x 200 cm` face visible with breathing room.

The guide splines do not create renderable surfaces, have renderer visibility
disabled, use X-ray/custom viewport colors where useful, and are excluded when
only `EXPORT_ROOT` is exported.

## Future web assembly contract

Every GLB is authored identically in Cinema 4D:

- Face center at local origin
- Outward normal along local `-Z`
- World depth along local `+Z`
- Nominal cube edge of `200 cm`

The Three.js loader will wrap each complete face assembly in a normalization
transform that maps the exported outward direction to the web scene's canonical
outward `+Z` and normalizes the measured edge to `2.0` units. C4D authors should
not pre-rotate individual objects to imitate the web coordinate convention.

After that whole-assembly normalization, assuming the web scene's master cube
center is `(0, 0, 0)` and the normalized cube edge is `2.0` Three.js units, the
conceptual face transforms are:

| Face | Position | Rotation |
| --- | --- | --- |
| Front (`+Z`) | `(0, 0, +1)` | none |
| Back (`-Z`) | `(0, 0, -1)` | `Y +180 degrees` |
| Right (`+X`) | `(+1, 0, 0)` | `Y +90 degrees` |
| Left (`-X`) | `(-1, 0, 0)` | `Y -90 degrees` |
| Top (`+Y`) | `(0, +1, 0)` | `X -90 degrees` |
| Bottom (`-Y`) | `(0, -1, 0)` | `X +90 degrees` |

These transforms are reference values, not a website implementation.

Cinema 4D is unit-aware but the effective C4D-to-glTF scale must not be
blindly assumed. After the first calibration GLB export, measure the nominal
`200 cm` edge in the loaded Three.js asset. The website should normalize the
asset so that measured edge becomes exactly `2.0` Three.js units when needed.

## Export checklist

1. Save the production `.c4d` file outside the Git repository.
2. Keep the viewing-face center at the local origin and outward direction at
   local `-Z`.
3. Preserve the exact `EXPORT_ROOT` immediate-child names.
4. Keep impossible-world scenery under `WORLD` and generally at `Z >= 0`.
5. Select/export only `EXPORT_ROOT`; exclude `_GUIDES`.
6. Verify the aperture remains a single, `-Z`-facing quad.
7. Measure the first calibration GLB before finalizing web scale conversion.
8. Optimize the approved GLB before placing it under
   `public/models/impossible_cube/`.
