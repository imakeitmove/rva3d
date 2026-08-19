# RVA3D Cinema 4D tools

This directory contains repository-tracked authoring tools for the RVA3D
impossible diorama cube. Production `.c4d` scenes belong outside this Git
repository.

## Create the canonical template

`create_diorama_template_002.py` is the canonical generator and targets the
Cinema 4D 2026 Python API. It creates a new, unsaved document and leaves the
document that was active when the script started unchanged.

1. Open Cinema 4D 2026.
2. Open **Script > Script Manager** (or press **Shift+F10**).
3. In the Script Manager, choose **File > Open** (or press **Ctrl+O**).
4. Select `tools/c4d/create_diorama_template_002.py` from this repository.
5. Click **Execute** at the bottom of the Script Manager.
6. Confirm the completion dialog and inspect the new document's hierarchy.
7. Save the generated document manually to the production scene location.

Suggested first template path:

```text
W:\PROJECTS\_ACTIVE\2026_RVA3D_Website\production\3D\impossible_cube\template\RVA3D_diorama_template_002.c4d
```

The script never saves a file, changes global Cinema 4D preferences, creates a
GLB, or edits the website.

Cinema 4D's documented `InsertBaseDocument` behavior can replace a completely
empty default document tab when a new document is inserted. It does not edit or
overwrite a non-empty scene, and the generator does not issue any close, kill,
or save command.

## Expected result

- Project scale/display unit: `1 centimeter`
- Outer frame boundary: `200 x 200 cm`
- Clear portal opening: `180 x 180 cm`
- Frame depth: `8 cm`, from `Z=0` to `Z=+8`
- Guide cube: `200 x 200 x 200 cm`, from `Z=0` to `Z=+200`
- Preview camera: `(0, 0, -350 cm)`, zero rotation, perspective, `50 mm`
- Preview gate/output: `36 mm`, `1000 x 1000 px`
- Portal normal/viewer side: `-Z`
- World depth: `+Z`
- Orientation check: `ORIENTATION_REFERENCE_DEFAULT_TEXT` at the portal plane
  should read normally through `PORTAL_PREVIEW_CAMERA`

See `diorama_template_spec.md` for the naming, coordinate, export, and web
assembly contracts.

## Legacy generator

`create_diorama_template.py` remains untouched so the original `_001` scene
can be reproduced if needed. It uses the superseded convention of camera and
viewer on `+Z` with world depth along `-Z`. Do not use it for new diorama
authoring.

## API notes

The implementation follows the Cinema 4D 2026.2 Python SDK's documented
classic scene API for `BaseDocument`, `PolygonObject`, `SplineObject`, camera
parameters, materials, and viewport visibility. It uses classic materials only
as lightweight viewport placeholders; production look development may replace
them.

The following behavior still requires an in-application check in the installed
Cinema 4D 2026 build:

- The active viewport should switch to `PORTAL_PREVIEW_CAMERA` immediately.
- The camera at `Z=-350` with zero H/P/B rotation should look through the
  portal toward `+Z`; no Target Expression or camera target link is used.
- `ORIENTATION_REFERENCE_DEFAULT_TEXT` and a newly created ordinary Text
  spline with an untouched transform should read normally, not mirrored or
  upside-down, through the preview camera.
- The custom colors and X-ray settings should remain legible in the selected
  viewport shading mode and color-management setup.
- The first glTF/GLB export must be measured to establish the effective
  Cinema 4D-centimeter to Three.js-unit scale.

The script has static validation in the repository, but it must not be treated
as tested inside Cinema 4D until that manual run is completed.

Official references:

- [Cinema 4D 2026.2 Python SDK](https://developers.maxon.net/docs/py/2026_2_0/)
- [Python Script Manager manual](https://developers.maxon.net/docs/py/2025_0_0/manuals/manual_py_script_manager.html)
- [Camera object parameters](https://developers.maxon.net/docs/py/2026_2_0/cinema_resource/object/ocamera.html)
