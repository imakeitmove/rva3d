"""Name-en-US: Create RVA3D Diorama Template 002
Description-en-US: Build the +Z-depth canonical RVA3D diorama document.

Run this file from Cinema 4D 2026's Script Manager. The script deliberately
creates and activates a separate document; it never edits or saves the active
document.
"""

from __future__ import annotations

import traceback

import c4d
from c4d import documents, gui


# Canonical dimensions in document centimeters.
OUTER_FACE_SIZE = 200.0
OUTER_HALF_SIZE = OUTER_FACE_SIZE / 2.0
PORTAL_SIZE = 180.0
PORTAL_HALF_SIZE = PORTAL_SIZE / 2.0
SAFE_AREA_SIZE = 160.0
SAFE_AREA_HALF_SIZE = SAFE_AREA_SIZE / 2.0
FRAME_BORDER = (OUTER_FACE_SIZE - PORTAL_SIZE) / 2.0
FRAME_DEPTH = 8.0
PHYSICAL_CUBE_DEPTH = 200.0
PORTAL_Z = 0.0
PREVIEW_CAMERA_Z = -350.0
PREVIEW_TARGET_Z = 100.0
PREVIEW_RESOLUTION = 1000.0
PREVIEW_FILM_GATE = 36.0

# Minimal viewport/material colors. Cinema 4D vectors use normalized RGB.
FRAME_COLOR = c4d.Vector(0.24, 0.27, 0.31)
PORTAL_COLOR = c4d.Vector(0.08, 0.67, 0.78)
GUIDE_CUBE_COLOR = c4d.Vector(0.95, 0.58, 0.12)
GUIDE_SAFE_COLOR = c4d.Vector(0.35, 0.90, 0.46)
GUIDE_DEPTH_COLOR = c4d.Vector(0.53, 0.66, 1.00)
GUIDE_TARGET_COLOR = c4d.Vector(1.00, 0.32, 0.44)
GUIDE_ORIENTATION_COLOR = c4d.Vector(1.00, 0.84, 0.18)


def set_identity_transform(node: c4d.BaseObject) -> None:
    """Set an explicit zero position/rotation and unit scale."""
    node.SetRelPos(c4d.Vector(0.0, 0.0, 0.0))
    node.SetRelRot(c4d.Vector(0.0, 0.0, 0.0))
    node.SetRelScale(c4d.Vector(1.0, 1.0, 1.0))


def create_null(name: str) -> c4d.BaseObject:
    """Create a zero-transform organizational null."""
    node = c4d.BaseObject(c4d.Onull)
    if node is None:
        raise MemoryError(f"Could not allocate null: {name}")
    node.SetName(name)
    set_identity_transform(node)
    return node


def insert_child(parent: c4d.BaseObject, child: c4d.BaseObject) -> None:
    """Append a child while preserving the declared Object Manager order."""
    child.InsertUnderLast(parent)


def set_custom_viewport_color(
    node: c4d.BaseObject,
    color: c4d.Vector,
    *,
    xray: bool = False,
    editor_only: bool = False,
) -> None:
    """Apply a predictable custom viewport color and optional guide settings."""
    node[c4d.ID_BASEOBJECT_USECOLOR] = c4d.ID_BASEOBJECT_USECOLOR_ALWAYS
    node[c4d.ID_BASEOBJECT_COLOR] = color
    node[c4d.ID_BASEOBJECT_XRAY] = xray
    if editor_only:
        node[c4d.ID_BASEOBJECT_VISIBILITY_RENDER] = c4d.OBJECT_OFF


def create_box_mesh(
    name: str,
    x_min: float,
    x_max: float,
    y_min: float,
    y_max: float,
    z_min: float,
    z_max: float,
) -> c4d.PolygonObject:
    """Create a six-quad box with dimensions encoded in its points.

    Encoding dimensions in point coordinates keeps the object's transform
    zeroed, which is useful for deterministic glTF export.
    """
    mesh = c4d.PolygonObject(8, 6)
    if mesh is None:
        raise MemoryError(f"Could not allocate polygon object: {name}")

    mesh.SetName(name)
    set_identity_transform(mesh)
    mesh.SetAllPoints(
        [
            c4d.Vector(x_min, y_min, z_max),
            c4d.Vector(x_max, y_min, z_max),
            c4d.Vector(x_max, y_max, z_max),
            c4d.Vector(x_min, y_max, z_max),
            c4d.Vector(x_min, y_min, z_min),
            c4d.Vector(x_max, y_min, z_min),
            c4d.Vector(x_max, y_max, z_min),
            c4d.Vector(x_min, y_max, z_min),
        ]
    )

    # Outward quads: +Z, -Z, -X, +X, +Y, -Y.
    polygons = (
        c4d.CPolygon(0, 1, 2, 3),
        c4d.CPolygon(4, 7, 6, 5),
        c4d.CPolygon(0, 3, 7, 4),
        c4d.CPolygon(1, 5, 6, 2),
        c4d.CPolygon(3, 2, 6, 7),
        c4d.CPolygon(0, 4, 5, 1),
    )
    for index, polygon in enumerate(polygons):
        mesh.SetPolygon(index, polygon)

    mesh.Message(c4d.MSG_UPDATE)
    return mesh


def create_portal_aperture() -> c4d.PolygonObject:
    """Create the single-quad, -Z-facing portal surface at Z=0."""
    aperture = c4d.PolygonObject(4, 1)
    if aperture is None:
        raise MemoryError("Could not allocate PORTAL_APERTURE")

    aperture.SetName("PORTAL_APERTURE")
    set_identity_transform(aperture)
    aperture.SetAllPoints(
        [
            c4d.Vector(-PORTAL_HALF_SIZE, -PORTAL_HALF_SIZE, PORTAL_Z),
            c4d.Vector(PORTAL_HALF_SIZE, -PORTAL_HALF_SIZE, PORTAL_Z),
            c4d.Vector(PORTAL_HALF_SIZE, PORTAL_HALF_SIZE, PORTAL_Z),
            c4d.Vector(-PORTAL_HALF_SIZE, PORTAL_HALF_SIZE, PORTAL_Z),
        ]
    )
    # Clockwise from the +Z side produces a -Z normal toward the camera.
    aperture.SetPolygon(0, c4d.CPolygon(0, 3, 2, 1))
    aperture.Message(c4d.MSG_UPDATE)
    return aperture


def create_segmented_spline(
    name: str,
    segments: tuple[tuple[tuple[float, float, float], ...], ...],
    color: c4d.Vector,
) -> c4d.SplineObject:
    """Create one editor-only linear spline containing several segments."""
    point_count = sum(len(segment) for segment in segments)
    spline = c4d.SplineObject(point_count, c4d.SPLINETYPE_LINEAR)
    if spline is None:
        raise MemoryError(f"Could not allocate guide spline: {name}")
    if not spline.ResizeObject(point_count, len(segments)):
        raise RuntimeError(f"Could not size guide spline: {name}")

    spline.SetName(name)
    set_identity_transform(spline)
    points = [c4d.Vector(*point) for segment in segments for point in segment]
    spline.SetAllPoints(points)
    for index, segment in enumerate(segments):
        spline.SetSegment(index, len(segment), False)

    set_custom_viewport_color(spline, color, xray=True, editor_only=True)
    spline.Message(c4d.MSG_UPDATE)
    return spline


def create_rectangle_guide(
    name: str,
    half_size: float,
    z_position: float,
    color: c4d.Vector,
) -> c4d.SplineObject:
    """Create a closed rectangular guide in the XY plane."""
    points = (
        (-half_size, -half_size, z_position),
        (half_size, -half_size, z_position),
        (half_size, half_size, z_position),
        (-half_size, half_size, z_position),
    )
    spline = c4d.SplineObject(4, c4d.SPLINETYPE_LINEAR)
    if spline is None:
        raise MemoryError(f"Could not allocate rectangle guide: {name}")
    if not spline.ResizeObject(4, 1):
        raise RuntimeError(f"Could not size rectangle guide: {name}")

    spline.SetName(name)
    set_identity_transform(spline)
    spline.SetAllPoints([c4d.Vector(*point) for point in points])
    spline.SetSegment(0, 4, True)
    set_custom_viewport_color(spline, color, xray=True, editor_only=True)
    spline.Message(c4d.MSG_UPDATE)
    return spline


def create_guide_cube() -> c4d.SplineObject:
    """Create a wire guide spanning X/Y +/-100 and Z 0 through +200."""
    front_z = 0.0
    back_z = PHYSICAL_CUBE_DEPTH
    h = OUTER_HALF_SIZE

    front_corners = (
        (-h, -h, front_z),
        (h, -h, front_z),
        (h, h, front_z),
        (-h, h, front_z),
    )
    back_corners = (
        (-h, -h, back_z),
        (h, -h, back_z),
        (h, h, back_z),
        (-h, h, back_z),
    )

    edge_pairs = (
        (front_corners[0], front_corners[1]),
        (front_corners[1], front_corners[2]),
        (front_corners[2], front_corners[3]),
        (front_corners[3], front_corners[0]),
        (back_corners[0], back_corners[1]),
        (back_corners[1], back_corners[2]),
        (back_corners[2], back_corners[3]),
        (back_corners[3], back_corners[0]),
        (front_corners[0], back_corners[0]),
        (front_corners[1], back_corners[1]),
        (front_corners[2], back_corners[2]),
        (front_corners[3], back_corners[3]),
    )
    return create_segmented_spline("GUIDE_CUBE", edge_pairs, GUIDE_CUBE_COLOR)


def create_orientation_reference() -> c4d.BaseObject:
    """Create a default-transform Text spline for front-orientation checking.

    Only its content, alignment, height, color, and visibility are changed.
    Its position, rotation, and scale remain the Cinema 4D defaults so it tests
    the same orientation as a newly created ordinary Text spline at Z=0.
    """
    text = c4d.BaseObject(c4d.Osplinetext)
    if text is None:
        raise MemoryError("Could not allocate orientation reference Text spline")
    text.SetName("ORIENTATION_REFERENCE_DEFAULT_TEXT")
    text[c4d.PRIM_TEXT_TEXT] = "RVA3D FRONT"
    text[c4d.PRIM_TEXT_ALIGN] = c4d.PRIM_TEXT_ALIGN_MIDDLE
    text[c4d.PRIM_TEXT_HEIGHT] = 20.0
    set_custom_viewport_color(
        text,
        GUIDE_ORIENTATION_COLOR,
        xray=True,
        editor_only=True,
    )
    return text


def create_material(name: str, color: c4d.Vector) -> c4d.BaseMaterial:
    """Create a minimal classic material suitable for viewport orientation."""
    material = c4d.BaseMaterial(c4d.Mmaterial)
    if material is None:
        raise MemoryError(f"Could not allocate material: {name}")
    material.SetName(name)
    material[c4d.MATERIAL_USE_COLOR] = True
    material[c4d.MATERIAL_COLOR_COLOR] = color
    material[c4d.MATERIAL_USE_REFLECTION] = False
    material.Message(c4d.MSG_UPDATE)
    return material


def assign_material(node: c4d.BaseObject, material: c4d.BaseMaterial) -> None:
    """Assign a material without texture projection complexity."""
    texture_tag = c4d.TextureTag()
    if texture_tag is None:
        raise MemoryError(f"Could not allocate texture tag for: {node.GetName()}")
    texture_tag.SetMaterial(material)
    node.InsertTag(texture_tag)


def build_document() -> tuple[c4d.documents.BaseDocument, c4d.BaseObject]:
    """Build the complete template off-screen and return it with its camera."""
    document = documents.BaseDocument()
    if document is None:
        raise MemoryError("Could not allocate a new Cinema 4D document")

    unit_scale = c4d.UnitScaleData()
    if not unit_scale.SetUnitScale(1.0, c4d.DOCUMENT_UNIT_CM):
        raise RuntimeError("Could not configure document units as centimeters")
    document[c4d.DOCUMENT_DOCUNIT] = unit_scale

    # A square gate matches the authored face. With a 36 mm sensor, 50 mm lens,
    # and a 350 cm camera distance, the portal plane spans about 252 cm in view.
    render_data = document.GetActiveRenderData()
    if render_data is None:
        raise RuntimeError("Could not access the document render settings")
    render_data[c4d.RDATA_LOCKRATIO] = False
    render_data[c4d.RDATA_XRES] = PREVIEW_RESOLUTION
    render_data[c4d.RDATA_YRES] = PREVIEW_RESOLUTION

    frame_material = create_material("MAT_FRAME_NEUTRAL", FRAME_COLOR)
    portal_material = create_material("MAT_PORTAL_PREVIEW", PORTAL_COLOR)
    document.InsertMaterial(frame_material)
    document.InsertMaterial(portal_material)

    export_root = create_null("EXPORT_ROOT")
    frame = create_null("FRAME")
    world = create_null("WORLD")
    aperture = create_portal_aperture()
    insert_child(export_root, frame)
    insert_child(export_root, aperture)
    insert_child(export_root, world)

    frame_top = create_box_mesh(
        "FRAME_TOP",
        -OUTER_HALF_SIZE,
        OUTER_HALF_SIZE,
        PORTAL_HALF_SIZE,
        OUTER_HALF_SIZE,
        0.0,
        FRAME_DEPTH,
    )
    frame_bottom = create_box_mesh(
        "FRAME_BOTTOM",
        -OUTER_HALF_SIZE,
        OUTER_HALF_SIZE,
        -OUTER_HALF_SIZE,
        -PORTAL_HALF_SIZE,
        0.0,
        FRAME_DEPTH,
    )
    frame_left = create_box_mesh(
        "FRAME_LEFT",
        -OUTER_HALF_SIZE,
        -PORTAL_HALF_SIZE,
        -PORTAL_HALF_SIZE,
        PORTAL_HALF_SIZE,
        0.0,
        FRAME_DEPTH,
    )
    frame_right = create_box_mesh(
        "FRAME_RIGHT",
        PORTAL_HALF_SIZE,
        OUTER_HALF_SIZE,
        -PORTAL_HALF_SIZE,
        PORTAL_HALF_SIZE,
        0.0,
        FRAME_DEPTH,
    )
    for frame_piece in (frame_top, frame_bottom, frame_left, frame_right):
        assign_material(frame_piece, frame_material)
        insert_child(frame, frame_piece)
    assign_material(aperture, portal_material)

    for group_name in ("STATIC", "ANIMATED", "PHYSICS"):
        insert_child(world, create_null(group_name))

    guides = create_null("_GUIDES")
    set_custom_viewport_color(guides, GUIDE_CUBE_COLOR, editor_only=True)

    guide_cube = create_guide_cube()
    safe_area = create_rectangle_guide(
        "GUIDE_SAFE_AREA",
        SAFE_AREA_HALF_SIZE,
        -0.10,
        GUIDE_SAFE_COLOR,
    )
    guide_depth = create_null("GUIDE_DEPTH")
    set_custom_viewport_color(guide_depth, GUIDE_DEPTH_COLOR, editor_only=True)
    for name, z_position in (
        ("DEPTH_PORTAL_Z_000", 0.0),
        ("DEPTH_CUBE_BACK_Z_POS_200", 200.0),
        ("DEPTH_DEEP_Z_POS_500", 500.0),
        ("DEPTH_EXTREME_Z_POS_1000", 1000.0),
    ):
        insert_child(
            guide_depth,
            create_rectangle_guide(
                name,
                PORTAL_HALF_SIZE,
                z_position,
                GUIDE_DEPTH_COLOR,
            ),
        )
    insert_child(guide_depth, create_orientation_reference())

    portal_target = create_null("PORTAL_TARGET")
    portal_target.SetRelPos(c4d.Vector(0.0, 0.0, PREVIEW_TARGET_Z))
    set_custom_viewport_color(
        portal_target,
        GUIDE_TARGET_COLOR,
        xray=True,
        editor_only=True,
    )

    camera = c4d.BaseObject(c4d.Ocamera)
    if camera is None:
        raise MemoryError("Could not allocate PORTAL_PREVIEW_CAMERA")
    camera.SetName("PORTAL_PREVIEW_CAMERA")
    camera.SetRelPos(c4d.Vector(0.0, 0.0, PREVIEW_CAMERA_Z))
    camera.SetRelRot(c4d.Vector(0.0, 0.0, 0.0))
    camera.SetRelScale(c4d.Vector(1.0, 1.0, 1.0))
    camera[c4d.CAMERA_PROJECTION] = c4d.Pperspective
    camera[c4d.CAMERA_FOCUS] = 50.0
    camera[c4d.CAMERAOBJECT_APERTURE] = PREVIEW_FILM_GATE

    for guide_node in (
        guide_cube,
        safe_area,
        guide_depth,
        portal_target,
        camera,
    ):
        insert_child(guides, guide_node)

    # EXPORT_ROOT and _GUIDES are deliberately separate document roots.
    document.InsertObject(export_root)
    document.InsertObject(guides)
    return document, camera


def completion_summary() -> str:
    """Return the concise completion message shown and printed after creation."""
    return "\n".join(
        (
            "RVA3D diorama template 002 created in a NEW, unsaved document.",
            "Outer face: 200 x 200 cm",
            "Portal aperture: 180 x 180 cm",
            "Physical cube depth: 200 cm (Z=0 to Z=+200)",
            "Convention: -Z outward to viewer; +Z inward into world",
            "Verify ORIENTATION_REFERENCE_DEFAULT_TEXT reads normally.",
            "Save manually as RVA3D_diorama_template_002.c4d.",
        )
    )


def main() -> None:
    """Cinema 4D Script Manager entry point."""
    try:
        new_document, preview_camera = build_document()

        # Inserting only after a successful build protects the active document
        # from partial changes if an allocation or API call fails.
        documents.InsertBaseDocument(new_document)
        documents.SetActiveDocument(new_document)

        active_view = new_document.GetActiveBaseDraw()
        if active_view is not None:
            active_view.SetSceneCamera(preview_camera)

        c4d.EventAdd()
        summary = completion_summary()
        print(summary)
        gui.MessageDialog(summary)
    except Exception as error:
        details = traceback.format_exc()
        print(details)
        gui.MessageDialog(
            "RVA3D diorama template 002 creation failed.\n\n"
            f"{error}\n\n"
            "The previously active document was not modified. "
            "See the Console for details."
        )


if __name__ == "__main__":
    main()
