"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./cube-lab.module.css";

const HOLD_DELAY_MS = 650;
const DRAG_THRESHOLD_PX = 7;
const TITLE_RESTORE_THRESHOLD_PX = 45;
const MIN_VISIBLE_CUBE_PX = 60;
const DEFERRED_CLICK_MS = 250;
const NODE_ID = "cube-node-1";
const FRONT_FACE = {
  id: "front-face",
} as const;

type EdgeName = "top" | "right" | "bottom" | "left";
type CornerName =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
type SnapTarget = EdgeName | CornerName;
type SnappedLayout = `snapped-${SnapTarget}`;
type LayoutMode = "standard" | "maximized" | SnappedLayout;
type Direction = "left" | "right" | "up" | "down";

type ContentNode = {
  id: string;
  title: string;
  neighbors: Partial<Record<Direction, string>>;
};

const CONTENT_NODES: Record<string, ContentNode> = {
  home: {
    id: "home",
    title: "Front",
    neighbors: {
      left: "library",
      right: "studio",
      up: "overview",
      down: "details",
    },
  },
  library: {
    id: "library",
    title: "Library",
    neighbors: { right: "home" },
  },
  studio: {
    id: "studio",
    title: "Studio",
    neighbors: { left: "home" },
  },
  overview: {
    id: "overview",
    title: "Overview",
    neighbors: { down: "home" },
  },
  details: {
    id: "details",
    title: "Details",
    neighbors: { up: "home" },
  },
};

const EDGE_DIRECTION: Record<EdgeName, Direction> = {
  left: "left",
  right: "right",
  top: "up",
  bottom: "down",
};

const SNAP_TARGETS: ReadonlyArray<{
  target: SnapTarget;
  label: string;
  kind: "edge" | "corner";
}> = [
  { target: "top", label: "top half", kind: "edge" },
  { target: "right", label: "right half", kind: "edge" },
  { target: "bottom", label: "bottom half", kind: "edge" },
  { target: "left", label: "left half", kind: "edge" },
  { target: "top-left", label: "top-left quarter", kind: "corner" },
  { target: "top-right", label: "top-right quarter", kind: "corner" },
  { target: "bottom-left", label: "bottom-left quarter", kind: "corner" },
  { target: "bottom-right", label: "bottom-right quarter", kind: "corner" },
];

function getSnapLayout(target: SnapTarget): SnappedLayout {
  return `snapped-${target}`;
}

function isInteractiveKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, button, a, [contenteditable]"),
  );
}

type Position = {
  x: number;
  y: number;
};

type ContextMenuPosition = {
  x: number;
  y: number;
};

type RestoreRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
  position: Position;
};

type GestureState = {
  active: boolean;
  pointerId: number | null;
  startPointerX: number;
  startPointerY: number;
  startObjectX: number;
  startObjectY: number;
  startNodeLeft: number;
  startNodeRight: number;
  startNodeTop: number;
  startNodeBottom: number;
  moved: boolean;
  holdTriggered: boolean;
  holdTimer: ReturnType<typeof setTimeout> | null;
};

type TitleGestureState = {
  active: boolean;
  pointerId: number | null;
  startPointerX: number;
  startPointerY: number;
  startObjectX: number;
  startObjectY: number;
  startNodeLeft: number;
  startNodeRight: number;
  startNodeTop: number;
  startNodeBottom: number;
  grabRatioX: number;
  grabOffsetY: number;
  restoredForDrag: boolean;
  moved: boolean;
};

type RotationGestureState = {
  active: boolean;
  pointerId: number | null;
  sourceEdge: EdgeName | null;
  axis: "x" | "y";
  direction: Direction;
  startPointerX: number;
  startPointerY: number;
  relevantDimension: number;
  signedDirection: 1 | -1;
  previewAngle: number;
  crossedThreshold: boolean;
  committing: boolean;
  destinationContentId: string | null;
};

export default function CubeLabPage() {
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTitleRestoring, setIsTitleRestoring] = useState(false);
  const [isTitlePending, setIsTitlePending] = useState(false);
  // The previous boolean maximized state is represented by layoutMode so snap
  // states can reuse the same expanded, interactive front-face content.
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("standard");
  const [activeSnapTarget, setActiveSnapTarget] =
    useState<SnapTarget | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeFaceId, setActiveFaceId] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState("home");
  const [shellRotation, setShellRotation] = useState({ x: 0, y: 0 });
  const [isRotationAnimating, setIsRotationAnimating] = useState(false);
  const [isRotationResetting, setIsRotationResetting] = useState(false);
  const [rotationDebug, setRotationDebug] = useState<{
    direction: Direction;
    angle: number;
  } | null>(null);

  const [contextMenu, setContextMenu] =
    useState<ContextMenuPosition | null>(null);

  const [faceMessage, setFaceMessage] = useState(
    "This area can now contain normal interactive HTML.",
  );

  const gesture = useRef<GestureState>({
    active: false,
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startObjectX: 0,
    startObjectY: 0,
    startNodeLeft: 0,
    startNodeRight: 0,
    startNodeTop: 0,
    startNodeBottom: 0,
    moved: false,
    holdTriggered: false,
    holdTimer: null,
  });
  const nodeRef = useRef<HTMLDivElement>(null);
  const restoreRectangle = useRef<RestoreRectangle | null>(null);
  const snapCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doubleClickSuppressionTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressDoubleClick = useRef(false);
  const suppressSnapClick = useRef(false);
  const rotationAnimationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const rotationResetFrame = useRef<number | null>(null);
  const rotationGesture = useRef<RotationGestureState>({
    active: false,
    pointerId: null,
    sourceEdge: null,
    axis: "y",
    direction: "left",
    startPointerX: 0,
    startPointerY: 0,
    relevantDimension: 1,
    signedDirection: 1,
    previewAngle: 0,
    crossedThreshold: false,
    committing: false,
    destinationContentId: null,
  });
  const titleGesture = useRef<TitleGestureState>({
    active: false,
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startObjectX: 0,
    startObjectY: 0,
    startNodeLeft: 0,
    startNodeRight: 0,
    startNodeTop: 0,
    startNodeBottom: 0,
    grabRatioX: 0.5,
    grabOffsetY: 0,
    restoredForDrag: true,
    moved: false,
  });

  const isExpanded = layoutMode !== "standard";
  const activeContent = CONTENT_NODES[activeContentId] ?? CONTENT_NODES.home;
  const faceTitle = activeContent.title;

  function getNeighborContent(direction: Direction) {
    const neighborId = activeContent.neighbors[direction];
    return neighborId ? CONTENT_NODES[neighborId] : undefined;
  }

  const physicalFaceContent = {
    front: activeContent,
    left: getNeighborContent("left"),
    right: getNeighborContent("right"),
    top: getNeighborContent("up"),
    bottom: getNeighborContent("down"),
    back: activeContent,
  };

  function activateFrontFace() {
    setActiveNodeId(NODE_ID);
    setActiveFaceId(FRONT_FACE.id);
  }

  function isFinitePosition(nextPosition: Position) {
    return Number.isFinite(nextPosition.x) && Number.isFinite(nextPosition.y);
  }

  function getClampedPosition(
    current: Pick<
      GestureState,
      | "startObjectX"
      | "startObjectY"
      | "startNodeLeft"
      | "startNodeRight"
      | "startNodeTop"
      | "startNodeBottom"
    >,
    deltaX: number,
    deltaY: number,
  ): Position | null {
    const clampedDeltaX = Math.min(
      window.innerWidth - MIN_VISIBLE_CUBE_PX - current.startNodeLeft,
      Math.max(MIN_VISIBLE_CUBE_PX - current.startNodeRight, deltaX),
    );
    const clampedDeltaY = Math.min(
      window.innerHeight - MIN_VISIBLE_CUBE_PX - current.startNodeTop,
      Math.max(MIN_VISIBLE_CUBE_PX - current.startNodeBottom, deltaY),
    );
    const nextPosition = {
      x: current.startObjectX + clampedDeltaX,
      y: current.startObjectY + clampedDeltaY,
    };

    return isFinitePosition(nextPosition) ? nextPosition : null;
  }

  function suppressDragDoubleClick() {
    suppressDoubleClick.current = true;
    if (doubleClickSuppressionTimer.current !== null) {
      clearTimeout(doubleClickSuppressionTimer.current);
    }
    doubleClickSuppressionTimer.current = setTimeout(() => {
      suppressDoubleClick.current = false;
      doubleClickSuppressionTimer.current = null;
    }, 350);
  }

  function clearHoldTimer() {
    if (gesture.current.holdTimer !== null) {
      clearTimeout(gesture.current.holdTimer);
      gesture.current.holdTimer = null;
    }
  }

  const restoreCube = useCallback(() => {
    const savedRectangle = restoreRectangle.current;
    if (
      layoutMode !== "standard" &&
      savedRectangle &&
      Number.isFinite(savedRectangle.position.x) &&
      Number.isFinite(savedRectangle.position.y)
    ) {
      setPosition(savedRectangle.position);
    }

    setLayoutMode("standard");
    setContextMenu(null);
  }, [layoutMode]);

  const expandCube = useCallback((
    nextLayout: Exclude<LayoutMode, "standard">,
  ) => {
    if (layoutMode === "standard") {
      const nodeRectangle = nodeRef.current?.getBoundingClientRect();

      if (
        nodeRectangle &&
        Number.isFinite(nodeRectangle.x) &&
        Number.isFinite(nodeRectangle.y) &&
        Number.isFinite(nodeRectangle.width) &&
        Number.isFinite(nodeRectangle.height) &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.y)
      ) {
        restoreRectangle.current = {
          x: nodeRectangle.x,
          y: nodeRectangle.y,
          width: nodeRectangle.width,
          height: nodeRectangle.height,
          position: { ...position },
        };
      }
    }

    setContextMenu(null);
    setLayoutMode(nextLayout);
  }, [layoutMode, position]);

  function clearPendingClickTimer() {
    if (pendingClickTimer.current !== null) {
      clearTimeout(pendingClickTimer.current);
      pendingClickTimer.current = null;
    }
  }

  function clearRotationAnimationTimer() {
    if (rotationAnimationTimer.current !== null) {
      clearTimeout(rotationAnimationTimer.current);
      rotationAnimationTimer.current = null;
    }
  }

  function scheduleClickAction(action: () => void) {
    clearPendingClickTimer();
    pendingClickTimer.current = setTimeout(() => {
      action();
      pendingClickTimer.current = null;
    }, DEFERRED_CLICK_MS);
  }

  function clearSnapCollapseTimer() {
    if (snapCollapseTimer.current !== null) {
      clearTimeout(snapCollapseTimer.current);
      snapCollapseTimer.current = null;
    }
  }

  function scheduleSnapCollapse() {
    clearSnapCollapseTimer();
    snapCollapseTimer.current = setTimeout(() => {
      setActiveSnapTarget(null);
      snapCollapseTimer.current = null;
    }, 300);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearPendingClickTimer();
        restoreCube();
        return;
      }

      if (
        event.key === "Enter" &&
        activeNodeId === NODE_ID &&
        activeFaceId === FRONT_FACE.id &&
        !isInteractiveKeyboardTarget(event.target)
      ) {
        event.preventDefault();
        clearPendingClickTimer();
        expandCube("maximized");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearHoldTimer();
      clearSnapCollapseTimer();
      clearPendingClickTimer();
      clearRotationAnimationTimer();
      if (doubleClickSuppressionTimer.current !== null) {
        clearTimeout(doubleClickSuppressionTimer.current);
      }
      if (rotationResetFrame.current !== null) {
        cancelAnimationFrame(rotationResetFrame.current);
      }
    };
  }, [activeFaceId, activeNodeId, expandCube, restoreCube]);

  useEffect(() => {
    if (layoutMode !== "maximized") {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [layoutMode]);

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    activateFrontFace();
    clearPendingClickTimer();
    setContextMenu(null);
    setIsPressed(true);

    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const nodeRectangle = nodeRef.current?.getBoundingClientRect();

    if (
      !nodeRectangle ||
      !Number.isFinite(nodeRectangle.left) ||
      !Number.isFinite(nodeRectangle.right) ||
      !Number.isFinite(nodeRectangle.top) ||
      !Number.isFinite(nodeRectangle.bottom) ||
      !isFinitePosition(position)
    ) {
      setIsPressed(false);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    gesture.current = {
      active: true,
      pointerId: event.pointerId,
      startPointerX: pointerX,
      startPointerY: pointerY,
      startObjectX: position.x,
      startObjectY: position.y,
      startNodeLeft: nodeRectangle.left,
      startNodeRight: nodeRectangle.right,
      startNodeTop: nodeRectangle.top,
      startNodeBottom: nodeRectangle.bottom,
      moved: false,
      holdTriggered: false,
      holdTimer: null,
    };

    gesture.current.holdTimer = setTimeout(() => {
      const current = gesture.current;

      if (
        !current.active ||
        current.pointerId !== event.pointerId ||
        current.moved
      ) {
        return;
      }

      current.holdTriggered = true;

      setIsPressed(false);
      setIsDragging(false);

      setContextMenu({
        x: Math.min(pointerX + 14, window.innerWidth - 76),
        y: Math.min(pointerY + 14, window.innerHeight - 76),
      });
    }, HOLD_DELAY_MS);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const current = gesture.current;

    if (
      !current.active ||
      current.pointerId !== event.pointerId ||
      current.holdTriggered
    ) {
      return;
    }

    const deltaX = event.clientX - current.startPointerX;
    const deltaY = event.clientY - current.startPointerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!current.moved && distance >= DRAG_THRESHOLD_PX) {
      current.moved = true;

      clearHoldTimer();
      setIsPressed(false);
      setIsDragging(true);
      setContextMenu(null);
    }

    if (!current.moved) {
      return;
    }

    const nextPosition = getClampedPosition(current, deltaX, deltaY);
    if (nextPosition) {
      setPosition(nextPosition);
    }
  }

  function finishGesture(
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) {
    const current = gesture.current;

    if (
      !current.active ||
      current.pointerId !== event.pointerId
    ) {
      return;
    }

    clearHoldTimer();

    if (cancelled) {
      clearPendingClickTimer();
    }

    const wasDrag = current.moved;
    const wasHold = current.holdTriggered;

    current.active = false;
    current.pointerId = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsPressed(false);
    setIsDragging(false);

    if (!cancelled && !wasDrag && !wasHold) {
      setContextMenu(null);
      scheduleClickAction(() => expandCube("maximized"));
    }
  }

  function handleLostPointerCapture(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    finishGesture(event, true);
  }

  function handleTitlePointerDown(
    event: ReactPointerEvent<HTMLElement>,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (
      event.target instanceof Element &&
      event.target.closest("button, input, select, textarea, a, [contenteditable]")
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    activateFrontFace();
    clearPendingClickTimer();

    const nodeRectangle = nodeRef.current?.getBoundingClientRect();
    if (
      !nodeRectangle ||
      !Number.isFinite(nodeRectangle.left) ||
      !Number.isFinite(nodeRectangle.right) ||
      !Number.isFinite(nodeRectangle.top) ||
      !Number.isFinite(nodeRectangle.bottom) ||
      !Number.isFinite(nodeRectangle.width) ||
      !Number.isFinite(nodeRectangle.height) ||
      nodeRectangle.width <= 0 ||
      nodeRectangle.height <= 0 ||
      !isFinitePosition(position)
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsTitlePending(true);

    titleGesture.current = {
      active: true,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startObjectX: position.x,
      startObjectY: position.y,
      startNodeLeft: nodeRectangle.left,
      startNodeRight: nodeRectangle.right,
      startNodeTop: nodeRectangle.top,
      startNodeBottom: nodeRectangle.bottom,
      grabRatioX: (event.clientX - nodeRectangle.left) / nodeRectangle.width,
      grabOffsetY: event.clientY - nodeRectangle.top,
      restoredForDrag: layoutMode === "standard",
      moved: false,
    };
  }

  function handleTitlePointerMove(
    event: ReactPointerEvent<HTMLElement>,
  ) {
    const current = titleGesture.current;
    if (!current.active || current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - current.startPointerX;
    const deltaY = event.clientY - current.startPointerY;

    if (!current.restoredForDrag) {
      if (deltaY < TITLE_RESTORE_THRESHOLD_PX) {
        return;
      }

      const savedRectangle = restoreRectangle.current;
      if (
        !savedRectangle ||
        !Number.isFinite(savedRectangle.x) ||
        !Number.isFinite(savedRectangle.y) ||
        !Number.isFinite(savedRectangle.width) ||
        !Number.isFinite(savedRectangle.height) ||
        !isFinitePosition(savedRectangle.position)
      ) {
        current.moved = false;
        setIsDragging(false);
        return;
      }

      current.moved = true;
      setIsTitlePending(false);
      setIsDragging(true);
      setContextMenu(null);

      const scaleX = savedRectangle.width / 320 || 1;
      const scaleY = savedRectangle.height / 220 || 1;
      const desiredLeft = Math.min(
        window.innerWidth - MIN_VISIBLE_CUBE_PX,
        Math.max(
          MIN_VISIBLE_CUBE_PX - savedRectangle.width,
          event.clientX - current.grabRatioX * savedRectangle.width,
        ),
      );
      const desiredTop = Math.min(
        window.innerHeight - MIN_VISIBLE_CUBE_PX,
        Math.max(
          MIN_VISIBLE_CUBE_PX - savedRectangle.height,
          event.clientY - Math.min(current.grabOffsetY, savedRectangle.height),
        ),
      );
      const restoredPosition = {
        x:
          savedRectangle.position.x +
          (desiredLeft - savedRectangle.x) / scaleX,
        y:
          savedRectangle.position.y +
          (desiredTop - savedRectangle.y) / scaleY,
      };

      if (!isFinitePosition(restoredPosition)) {
        current.moved = false;
        setIsDragging(false);
        return;
      }

      setLayoutMode("standard");
      setPosition(restoredPosition);
      setIsTitleRestoring(true);
      current.restoredForDrag = true;
      current.startPointerX = event.clientX;
      current.startPointerY = event.clientY;
      current.startObjectX = restoredPosition.x;
      current.startObjectY = restoredPosition.y;
      current.startNodeLeft = desiredLeft;
      current.startNodeRight = desiredLeft + savedRectangle.width;
      current.startNodeTop = desiredTop;
      current.startNodeBottom = desiredTop + savedRectangle.height;
      return;
    }

    if (!current.moved) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }

      current.moved = true;
      setIsTitlePending(false);
      setIsDragging(true);
      setContextMenu(null);
    }

    const nextPosition = getClampedPosition(current, deltaX, deltaY);
    if (nextPosition) {
      setPosition(nextPosition);
    }
  }

  function finishTitleGesture(
    event: ReactPointerEvent<HTMLElement>,
    cancelled = false,
  ) {
    const current = titleGesture.current;
    if (!current.active || current.pointerId !== event.pointerId) {
      return;
    }

    const completedDrag = current.moved && !cancelled;
    current.active = false;
    current.pointerId = null;
    current.moved = false;
    setIsDragging(false);
    setIsTitleRestoring(false);
    setIsTitlePending(false);

    if (completedDrag) {
      clearPendingClickTimer();
      suppressDragDoubleClick();
    }

    if (cancelled) {
      clearPendingClickTimer();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

  }

  function handleSnapPointerEnter(
    target: SnapTarget,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.pointerType === "touch") {
      return;
    }

    clearSnapCollapseTimer();
    setActiveSnapTarget(target);
  }

  function handleRotationPointerDown(
    edge: EdgeName,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (layoutMode !== "standard" || rotationGesture.current.committing) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const nodeRectangle = nodeRef.current?.getBoundingClientRect();
    if (
      !nodeRectangle ||
      !Number.isFinite(nodeRectangle.width) ||
      !Number.isFinite(nodeRectangle.height) ||
      nodeRectangle.width <= 0 ||
      nodeRectangle.height <= 0
    ) {
      return;
    }

    const direction = EDGE_DIRECTION[edge];
    const destinationContentId = activeContent.neighbors[direction] ?? null;
    const isHorizontal = edge === "left" || edge === "right";

    suppressSnapClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    rotationGesture.current = {
      active: true,
      pointerId: event.pointerId,
      sourceEdge: edge,
      axis: isHorizontal ? "y" : "x",
      direction,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      relevantDimension: isHorizontal
        ? nodeRectangle.width
        : nodeRectangle.height,
      signedDirection:
        edge === "left" || edge === "bottom" ? 1 : -1,
      previewAngle: 0,
      crossedThreshold: false,
      committing: false,
      destinationContentId,
    };
  }

  function handleRotationPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    const current = rotationGesture.current;
    if (
      !current.active ||
      current.pointerId !== event.pointerId ||
      !current.sourceEdge ||
      current.committing
    ) {
      return;
    }

    const deltaX = event.clientX - current.startPointerX;
    const deltaY = event.clientY - current.startPointerY;
    if (
      !current.crossedThreshold &&
      Math.hypot(deltaX, deltaY) < 8
    ) {
      return;
    }

    if (!current.crossedThreshold) {
      current.crossedThreshold = true;
      suppressSnapClick.current = true;
      clearPendingClickTimer();
      clearHoldTimer();
      setContextMenu(null);
    }

    const inwardDistance = Math.max(
      0,
      current.sourceEdge === "left"
        ? deltaX
        : current.sourceEdge === "right"
          ? -deltaX
          : current.sourceEdge === "top"
            ? deltaY
            : -deltaY,
    );
    const previewAngle = Math.min(
      100,
      (inwardDistance / (current.relevantDimension * 0.45)) * 90,
    );
    const signedAngle = previewAngle * current.signedDirection;

    current.previewAngle = previewAngle;
    setShellRotation(
      current.axis === "x"
        ? { x: signedAngle, y: 0 }
        : { x: 0, y: signedAngle },
    );
    setRotationDebug({
      direction: current.direction,
      angle: previewAngle,
    });
  }

  function finishRotationGesture(
    event: ReactPointerEvent<HTMLButtonElement>,
    cancelled = false,
  ) {
    const current = rotationGesture.current;
    if (!current.active || current.pointerId !== event.pointerId) {
      return;
    }

    const crossedThreshold = current.crossedThreshold;
    const shouldCommit =
      !cancelled &&
      crossedThreshold &&
      current.previewAngle >= 40 &&
      current.destinationContentId !== null;

    current.active = false;
    current.pointerId = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!crossedThreshold) {
      return;
    }

    suppressSnapClick.current = true;
    suppressDragDoubleClick();
    clearPendingClickTimer();
    clearRotationAnimationTimer();
    current.committing = true;
    setIsRotationAnimating(true);

    const finalAngle = shouldCommit ? 90 * current.signedDirection : 0;
    setShellRotation(
      current.axis === "x"
        ? { x: finalAngle, y: 0 }
        : { x: 0, y: finalAngle },
    );

    const animationDuration = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? 30
      : 220;

    rotationAnimationTimer.current = setTimeout(() => {
      if (shouldCommit && current.destinationContentId) {
        setIsRotationResetting(true);
        setIsRotationAnimating(false);
        setActiveContentId(current.destinationContentId);
        setShellRotation({ x: 0, y: 0 });
        rotationResetFrame.current = requestAnimationFrame(() => {
          setIsRotationResetting(false);
          rotationResetFrame.current = null;
        });
      } else {
        setIsRotationAnimating(false);
      }

      current.committing = false;
      current.previewAngle = 0;
      current.crossedThreshold = false;
      setRotationDebug(null);
      rotationAnimationTimer.current = null;
    }, animationDuration);

    setTimeout(() => {
      suppressSnapClick.current = false;
    }, 0);
  }

  function cancelRotationGesture(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    const current = rotationGesture.current;
    if (!current.active || current.pointerId !== event.pointerId) {
      return;
    }

    const crossedThreshold = current.crossedThreshold;
    current.active = false;
    current.pointerId = null;
    current.crossedThreshold = false;
    current.previewAngle = 0;
    current.committing = false;
    suppressSnapClick.current = crossedThreshold;
    clearRotationAnimationTimer();
    setIsRotationAnimating(false);
    setIsRotationResetting(false);
    setShellRotation({ x: 0, y: 0 });
    setRotationDebug(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setTimeout(() => {
      suppressSnapClick.current = false;
    }, 0);
  }

  function handleSnapClick(target: SnapTarget) {
    if (suppressSnapClick.current) {
      suppressSnapClick.current = false;
      return;
    }

    const snapLayout = getSnapLayout(target);
    scheduleClickAction(() => {
      expandCube(layoutMode === snapLayout ? "maximized" : snapLayout);
    });
  }

  function handleFaceDoubleClick() {
    clearPendingClickTimer();

    if (suppressDoubleClick.current) {
      suppressDoubleClick.current = false;
      return;
    }

    if (layoutMode === "maximized") {
      restoreCube();
      return;
    }

    expandCube("maximized");
  }

  return (
    <main
      className={styles.viewport}
      onPointerDown={() => setContextMenu(null)}
    >
      <section className={styles.intro}>
        <p>Cube UI Prototype</p>
        <h1>One object, six content faces.</h1>
      </section>

      <div
        className={`${styles.scene} ${isExpanded ? styles.expandedScene : ""}`}
      >
        <div
          ref={nodeRef}
          className={[
            styles.node,
            isPressed ? styles.pressed : "",
            isDragging ? styles.dragging : "",
            isTitlePending ? styles.titlePending : "",
            rotationDebug ? styles.rotationPreview : "",
            isRotationAnimating ? styles.rotationAnimating : "",
            isRotationResetting ? styles.rotationResetting : "",
            isExpanded ? styles.maximized : "",
            layoutMode === "maximized" ? styles.fullscreen : "",
            layoutMode === "snapped-left" ? styles.snappedLeft : "",
            layoutMode === "snapped-right" ? styles.snappedRight : "",
            layoutMode === "snapped-top" ? styles.snappedTop : "",
            layoutMode === "snapped-bottom" ? styles.snappedBottom : "",
            layoutMode === "snapped-top-left" ? styles.snappedTopLeft : "",
            layoutMode === "snapped-top-right" ? styles.snappedTopRight : "",
            layoutMode === "snapped-bottom-left"
              ? styles.snappedBottomLeft
              : "",
            layoutMode === "snapped-bottom-right"
              ? styles.snappedBottomRight
              : "",
            activeNodeId === NODE_ID && activeFaceId === FRONT_FACE.id
              ? styles.activeNode
              : "",
          ].join(" ")}
          style={
            isExpanded
              ? undefined
              : {
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(var(--cube-standard-scale))`,
                  transformOrigin: "center",
                }
          }
        >
          <div
            className={styles.cuboid}
            style={{
              transform: `rotateX(${shellRotation.x}deg) rotateY(${shellRotation.y}deg)`,
            }}
          >
            <div
              className={`${styles.face} ${styles.front}`}
              onPointerEnter={activateFrontFace}
              onPointerDownCapture={activateFrontFace}
              onFocusCapture={activateFrontFace}
              onDoubleClick={handleFaceDoubleClick}
            >
              {isExpanded || isTitleRestoring ? (
                <div className={styles.maximizedFace}>
                  <header
                    className={styles.titleBar}
                    onPointerDown={handleTitlePointerDown}
                    onPointerMove={handleTitlePointerMove}
                    onPointerUp={finishTitleGesture}
                    onPointerCancel={(event) =>
                      finishTitleGesture(event, true)
                    }
                    onLostPointerCapture={(event) =>
                      finishTitleGesture(event, true)
                    }
                  >
                    <button
                      type="button"
                      className={styles.restoreButton}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => scheduleClickAction(restoreCube)}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        handleFaceDoubleClick();
                      }}
                      aria-label={`Restore ${faceTitle}`}
                      title={`Restore ${faceTitle}`}
                    >
                      ↙
                    </button>

                    <span className={styles.faceTitle}>{faceTitle}</span>

                    <span className={styles.titleBarSpacer} />
                  </header>

                  <div className={styles.faceContent}>
                    <p className={styles.eyebrow}>
                      Interactive HTML content
                    </p>

                    <h2>
                      {layoutMode === "maximized"
                        ? "The cube is maximized."
                        : "The cube is snapped."}
                    </h2>

                    <p>{faceMessage}</p>

                    <button
                      type="button"
                      className={styles.contentButton}
                      onClick={() =>
                        setFaceMessage(
                          "The HTML button was clicked 🙂",
                        )
                      }
                    >
                      Test HTML button
                    </button>

                    <p className={styles.restoreHint}>
                      Use the arrow at top left or press Escape
                      to restore the cube.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <header
                    className={`${styles.titleBar} ${styles.standardTitleBar}`}
                    onPointerDown={handleTitlePointerDown}
                    onPointerMove={handleTitlePointerMove}
                    onPointerUp={finishTitleGesture}
                    onPointerCancel={(event) =>
                      finishTitleGesture(event, true)
                    }
                    onLostPointerCapture={(event) =>
                      finishTitleGesture(event, true)
                    }
                  >
                    <span className={styles.faceTitle}>{faceTitle}</span>
                  </header>
                  {/* The former centered title is now represented by the
                      draggable title bar above. */}
                  {/* <strong>{faceTitle}</strong> */}
                  <span>Main content face</span>

                  <div
                    className={styles.gestureSurface}
                    role="button"
                    tabIndex={0}
                    aria-label={`${faceTitle}: tap to maximize, drag to move, or hold for a context menu`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(event) =>
                      finishGesture(event)
                    }
                    onPointerCancel={(event) =>
                      finishGesture(event, true)
                    }
                    onLostPointerCapture={handleLostPointerCapture}
                    onContextMenu={(event) =>
                      event.preventDefault()
                    }
                    onKeyDown={(event) => {
                      if (event.key === " ") {
                        event.preventDefault();
                        scheduleClickAction(() => expandCube("maximized"));
                      }
                    }}
                  />
                </>
              )}

              {SNAP_TARGETS.map(({ target, label, kind }) => (
                <button
                  key={target}
                  type="button"
                  className={`${styles.snapZone} ${
                    kind === "corner" ? styles.cornerZone : styles.edgeZone
                  }`}
                  data-target={target}
                  data-active={activeSnapTarget === target}
                  aria-label={`${faceTitle}: snap to ${label}`}
                  onPointerEnter={(event) =>
                    handleSnapPointerEnter(target, event)
                  }
                  onPointerLeave={scheduleSnapCollapse}
                  onPointerDown={(event) => {
                    setActiveSnapTarget(target);
                    if (kind === "edge") {
                      handleRotationPointerDown(target as EdgeName, event);
                    }
                  }}
                  onPointerMove={(event) => {
                    if (kind === "edge") {
                      handleRotationPointerMove(event);
                    }
                  }}
                  onPointerUp={(event) => {
                    scheduleSnapCollapse();
                    if (kind === "edge") {
                      finishRotationGesture(event);
                    }
                  }}
                  onPointerCancel={(event) => {
                    clearPendingClickTimer();
                    scheduleSnapCollapse();
                    if (kind === "edge") {
                      cancelRotationGesture(event);
                    }
                  }}
                  onLostPointerCapture={(event) => {
                    if (kind === "edge") {
                      cancelRotationGesture(event);
                    }
                  }}
                  onClick={() => handleSnapClick(target)}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    handleFaceDoubleClick();
                  }}
                />
              ))}
            </div>

            <div className={`${styles.face} ${styles.back}`}>
              <strong>{physicalFaceContent.back.title}</strong>
              <span>Physical back slot</span>
            </div>

            <div className={`${styles.face} ${styles.left}`}>
              <strong>{physicalFaceContent.left?.title ?? "No neighbor"}</strong>
            </div>

            <div className={`${styles.face} ${styles.right}`}>
              <strong>{physicalFaceContent.right?.title ?? "No neighbor"}</strong>
            </div>

            <div className={`${styles.face} ${styles.top}`}>
              <strong>{physicalFaceContent.top?.title ?? "No neighbor"}</strong>
            </div>

            <div className={`${styles.face} ${styles.bottom}`}>
              <strong>{physicalFaceContent.bottom?.title ?? "No neighbor"}</strong>
            </div>
          </div>
        </div>
      </div>

      {!isExpanded && (
        <p className={styles.instructions}>
          Tap center to maximize · Drag center to move · Hold
          center for menu
        </p>
      )}

      {!isExpanded && (
        <div className={styles.rotationDebug} aria-live="polite">
          <span>Active: {faceTitle}</span>
          {rotationDebug && (
            <span>
              {rotationDebug.direction} {rotationDebug.angle.toFixed(0)}°
            </span>
          )}
        </div>
      )}

      {contextMenu && (
        <div
          className={styles.contextMenu}
          role="menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            aria-label="Smiley"
            onClick={() => setContextMenu(null)}
          >
            🙂
          </button>
        </div>
      )}
    </main>
  );
}
