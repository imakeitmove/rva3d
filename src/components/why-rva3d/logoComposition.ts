export type LogoCompositionLayout = {
  canvasHeight: number;
  canvasWidth: number;
  headlineHeight: number;
  stageHeight: number;
  stageTop: number;
  stageWidth: number;
};

export type LogoCompositionMetrics = {
  finalLogoCenterY: number;
  finalLogoWidth: number;
  gap: number;
  headlineShift: number;
  initialLogoCenterY: number;
  initialThreeDWidth: number;
};

// Measured from the authored GLB at its first and final keyframes. Keeping
// these values beside the responsive composition math makes the endpoint fit
// deterministic; the camera never has to move to fake a responsive crop.
export const RVA3D_AUTHORED_BOUNDS = {
  final: {
    centerX: -0.0005585933,
    centerY: 0.0020398082,
    height: 0.0557172141,
    width: 0.2027219619,
  },
  initialThreeD: {
    centerX: 0.0006062514,
    centerY: -0.0000875974,
    height: 0.0541105833,
    width: 0.0849677918,
  },
} as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getFinalLogoWidth(stageWidth: number) {
  if (stageWidth <= 760) {
    // On phones the completed lockup uses most of the stage, while retaining
    // a small, reliable safe area for the outer glyphs.
    return Math.max(0, stageWidth - (stageWidth <= 390 ? 24 : 32));
  }

  if (stageWidth < 1200) {
    return Math.min(
      stageWidth - 56,
      clamp(stageWidth * 0.64, 460, 620),
    );
  }

  // Desktop guidance: approximately 600-760 CSS pixels rather than a fixed
  // percentage of the full-width canvas.
  return clamp(stageWidth * 0.43, 600, 760);
}

export function getLogoCompositionMetrics(
  layout: LogoCompositionLayout,
): LogoCompositionMetrics {
  const gap = clamp(layout.stageHeight * 0.055, 24, 48);
  const finalAspectRatio =
    RVA3D_AUTHORED_BOUNDS.final.height /
    RVA3D_AUTHORED_BOUNDS.final.width;
  const widthLimitedLogoWidth = getFinalLogoWidth(layout.stageWidth);
  const heightLimitedLogoWidth = Math.max(
    160,
    (layout.stageHeight - layout.headlineHeight - gap - 16) /
      finalAspectRatio,
  );
  const finalLogoWidth = Math.min(
    widthLimitedLogoWidth,
    heightLimitedLogoWidth,
  );
  const finalLogoHeight =
    finalLogoWidth * finalAspectRatio;
  const initialThreeDWidth =
    layout.stageWidth <= 760
      ? clamp(finalLogoWidth * 0.54, 176, 236)
      : layout.stageWidth < 1200
        ? clamp(finalLogoWidth * 0.5, 220, 310)
        : clamp(finalLogoWidth * 0.48, 280, 340);
  const initialThreeDHeight =
    initialThreeDWidth *
    (RVA3D_AUTHORED_BOUNDS.initialThreeD.height /
      RVA3D_AUTHORED_BOUNDS.initialThreeD.width);
  const stackHeight = layout.headlineHeight + gap + finalLogoHeight;
  const stackTop = Math.max(8, (layout.stageHeight - stackHeight) / 2);
  const headlineCenterY = stackTop + layout.headlineHeight / 2;
  const finalLogoCenterY =
    stackTop + layout.headlineHeight + gap + finalLogoHeight / 2;
  /* Previous entrance placement retained for composition rollback:
     const firstThreeDCenterY = layout.stageHeight / 2 +
       layout.headlineHeight / 2 + gap + initialThreeDHeight / 2;
     const initialLogoCenterY = Math.min(
       layout.stageHeight - initialThreeDHeight / 2 - 8,
       firstThreeDCenterY,
     );

     The first visible 3D frame now begins modestly below the unchanged final
     center. This preserves upward arrival while avoiding a full glyph-height
     climb through the headline's space. */
  const initialArrivalOffset = clamp(layout.stageHeight * 0.045, 20, 34);
  const initialLogoCenterY = Math.min(
    layout.stageHeight - initialThreeDHeight / 2 - 8,
    finalLogoCenterY + initialArrivalOffset,
  );

  return {
    finalLogoCenterY,
    finalLogoWidth,
    gap,
    headlineShift: headlineCenterY - layout.stageHeight / 2,
    initialLogoCenterY,
    initialThreeDWidth,
  };
}
