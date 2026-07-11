"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./cube-lab.module.css";

const HOLD_DELAY_MS = 650;
const DRAG_THRESHOLD_PX = 7;
const MIN_VISIBLE_CUBE_PX = 60;
const DEFERRED_CLICK_MS = 250;
const NODE_ID = "cube-node-1";
const FACE_ID = "front-face";

type LayoutMode =
  | "standard"
  | "maximized"
  | "snapped-left"
  | "snapped-right"
  | "snapped-top"
  | "snapped-bottom";

type EdgeName = "top" | "right" | "bottom" | "left";

const EDGE_LAYOUT: Record<
  EdgeName,
  Exclude<LayoutMode, "standard" | "maximized">
> = {
  top: "snapped-top",
  right: "snapped-right",
  bottom: "snapped-bottom",
  left: "snapped-left",
};

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

export default function CubeLabPage() {
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTitleRestoring, setIsTitleRestoring] = useState(false);
  // The previous boolean maximized state is represented by layoutMode so snap
  // states can reuse the same expanded, interactive front-face content.
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("standard");
  const [activeEdge, setActiveEdge] = useState<EdgeName | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeFaceId, setActiveFaceId] = useState<string | null>(null);

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
  const edgeCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  function activateFrontFace() {
    setActiveNodeId(NODE_ID);
    setActiveFaceId(FACE_ID);
  }

  function isFinitePosition(nextPosition: Position) {
    return Number.isFinite(nextPosition.x) && Number.isFinite(nextPosition.y);
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

  function scheduleClickAction(action: () => void) {
    clearPendingClickTimer();
    pendingClickTimer.current = setTimeout(() => {
      action();
      pendingClickTimer.current = null;
    }, DEFERRED_CLICK_MS);
  }

  function clearEdgeCollapseTimer() {
    if (edgeCollapseTimer.current !== null) {
      clearTimeout(edgeCollapseTimer.current);
      edgeCollapseTimer.current = null;
    }
  }

  function scheduleEdgeCollapse() {
    clearEdgeCollapseTimer();
    edgeCollapseTimer.current = setTimeout(() => {
      setActiveEdge(null);
      edgeCollapseTimer.current = null;
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
        activeFaceId === FACE_ID &&
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
      clearEdgeCollapseTimer();
      clearPendingClickTimer();
    };
  }, [activeFaceId, activeNodeId, expandCube, restoreCube]);

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

    if (isFinitePosition(nextPosition)) {
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

    event.preventDefault();
    event.stopPropagation();
    activateFrontFace();
    clearPendingClickTimer();

    const nodeRectangle = nodeRef.current?.getBoundingClientRect();
    if (!nodeRectangle) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

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

    let deltaX = event.clientX - current.startPointerX;
    let deltaY = event.clientY - current.startPointerY;

    if (!current.moved) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }

      current.moved = true;
      setIsDragging(true);
      setContextMenu(null);
    }

    if (!current.restoredForDrag) {
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

    deltaX = event.clientX - current.startPointerX;
    deltaY = event.clientY - current.startPointerY;
    const clampedDeltaX = Math.min(
      window.innerWidth - MIN_VISIBLE_CUBE_PX - current.startNodeLeft,
      Math.max(MIN_VISIBLE_CUBE_PX - current.startNodeRight, deltaX),
    );
    const clampedDeltaY = Math.min(
      window.innerHeight - MIN_VISIBLE_CUBE_PX - current.startNodeTop,
      Math.max(MIN_VISIBLE_CUBE_PX - current.startNodeBottom, deltaY),
    );

    setPosition({
      x: current.startObjectX + clampedDeltaX,
      y: current.startObjectY + clampedDeltaY,
    });
  }

  function finishTitleGesture(
    event: ReactPointerEvent<HTMLElement>,
    cancelled = false,
  ) {
    const current = titleGesture.current;
    if (!current.active || current.pointerId !== event.pointerId) {
      return;
    }

    current.active = false;
    current.pointerId = null;
    setIsDragging(false);
    setIsTitleRestoring(false);

    if (cancelled) {
      clearPendingClickTimer();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleEdgePointerEnter(
    edge: EdgeName,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.pointerType === "touch") {
      return;
    }

    clearEdgeCollapseTimer();
    setActiveEdge(edge);
  }

  function handleEdgeClick(edge: EdgeName) {
    const edgeLayout = EDGE_LAYOUT[edge];
    scheduleClickAction(() => {
      expandCube(layoutMode === edgeLayout ? "maximized" : edgeLayout);
    });
  }

  function handleFaceDoubleClick() {
    clearPendingClickTimer();

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
            isExpanded ? styles.maximized : "",
            layoutMode === "snapped-left" ? styles.snappedLeft : "",
            layoutMode === "snapped-right" ? styles.snappedRight : "",
            layoutMode === "snapped-top" ? styles.snappedTop : "",
            layoutMode === "snapped-bottom" ? styles.snappedBottom : "",
            activeNodeId === NODE_ID && activeFaceId === FACE_ID
              ? styles.activeNode
              : "",
          ].join(" ")}
          style={
            isExpanded
              ? undefined
              : {
                  transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                }
          }
        >
          <div className={styles.cuboid}>
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
                      aria-label="Restore cube"
                      title="Restore cube"
                    >
                      ↙
                    </button>

                    <span className={styles.faceTitle}>
                      Front face
                    </span>

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
                  <strong>Front</strong>
                  <span>Main content face</span>

                  <div
                    className={styles.gestureSurface}
                    role="button"
                    tabIndex={0}
                    aria-label="Tap to maximize, drag to move, or hold for a context menu"
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

              <button
                type="button"
                className={`${styles.edgeZone} ${styles.edgeTop}`}
                data-active={activeEdge === "top"}
                aria-label="Snap cube to top half"
                onPointerEnter={(event) => handleEdgePointerEnter("top", event)}
                onPointerLeave={scheduleEdgeCollapse}
                onPointerDown={() => setActiveEdge("top")}
                onPointerUp={scheduleEdgeCollapse}
                onPointerCancel={() => {
                  clearPendingClickTimer();
                  scheduleEdgeCollapse();
                }}
                onClick={() => handleEdgeClick("top")}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  handleFaceDoubleClick();
                }}
              />
              <button
                type="button"
                className={`${styles.edgeZone} ${styles.edgeRight}`}
                data-active={activeEdge === "right"}
                aria-label="Snap cube to right half"
                onPointerEnter={(event) =>
                  handleEdgePointerEnter("right", event)
                }
                onPointerLeave={scheduleEdgeCollapse}
                onPointerDown={() => setActiveEdge("right")}
                onPointerUp={scheduleEdgeCollapse}
                onPointerCancel={() => {
                  clearPendingClickTimer();
                  scheduleEdgeCollapse();
                }}
                onClick={() => handleEdgeClick("right")}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  handleFaceDoubleClick();
                }}
              />
              <button
                type="button"
                className={`${styles.edgeZone} ${styles.edgeBottom}`}
                data-active={activeEdge === "bottom"}
                aria-label="Snap cube to bottom half"
                onPointerEnter={(event) =>
                  handleEdgePointerEnter("bottom", event)
                }
                onPointerLeave={scheduleEdgeCollapse}
                onPointerDown={() => setActiveEdge("bottom")}
                onPointerUp={scheduleEdgeCollapse}
                onPointerCancel={() => {
                  clearPendingClickTimer();
                  scheduleEdgeCollapse();
                }}
                onClick={() => handleEdgeClick("bottom")}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  handleFaceDoubleClick();
                }}
              />
              <button
                type="button"
                className={`${styles.edgeZone} ${styles.edgeLeft}`}
                data-active={activeEdge === "left"}
                aria-label="Snap cube to left half"
                onPointerEnter={(event) =>
                  handleEdgePointerEnter("left", event)
                }
                onPointerLeave={scheduleEdgeCollapse}
                onPointerDown={() => setActiveEdge("left")}
                onPointerUp={scheduleEdgeCollapse}
                onPointerCancel={() => {
                  clearPendingClickTimer();
                  scheduleEdgeCollapse();
                }}
                onClick={() => handleEdgeClick("left")}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  handleFaceDoubleClick();
                }}
              />
            </div>

            <div className={`${styles.face} ${styles.back}`}>
              <strong>Back</strong>
              <span>Secondary content</span>
            </div>

            <div className={`${styles.face} ${styles.left}`}>
              <strong>Left</strong>
            </div>

            <div className={`${styles.face} ${styles.right}`}>
              <strong>Right</strong>
            </div>

            <div className={`${styles.face} ${styles.top}`}>
              <strong>Top</strong>
            </div>

            <div className={`${styles.face} ${styles.bottom}`}>
              <strong>Bottom</strong>
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
