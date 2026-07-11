"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./cube-lab.module.css";

const HOLD_DELAY_MS = 650;
const DRAG_THRESHOLD_PX = 7;

type Position = {
  x: number;
  y: number;
};

type ContextMenuPosition = {
  x: number;
  y: number;
};

type GestureState = {
  active: boolean;
  pointerId: number | null;
  startPointerX: number;
  startPointerY: number;
  startObjectX: number;
  startObjectY: number;
  moved: boolean;
  holdTriggered: boolean;
  holdTimer: ReturnType<typeof setTimeout> | null;
};

export default function CubeLabPage() {
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

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
    moved: false,
    holdTriggered: false,
    holdTimer: null,
  });

  function clearHoldTimer() {
    if (gesture.current.holdTimer !== null) {
      clearTimeout(gesture.current.holdTimer);
      gesture.current.holdTimer = null;
    }
  }

  function restoreCube() {
    setIsMaximized(false);
    setContextMenu(null);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        restoreCube();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearHoldTimer();
    };
  }, []);

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setContextMenu(null);
    setIsPressed(true);

    event.currentTarget.setPointerCapture(event.pointerId);

    const pointerX = event.clientX;
    const pointerY = event.clientY;

    gesture.current = {
      active: true,
      pointerId: event.pointerId,
      startPointerX: pointerX,
      startPointerY: pointerY,
      startObjectX: position.x,
      startObjectY: position.y,
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

    setPosition({
      x: current.startObjectX + deltaX,
      y: current.startObjectY + deltaY,
    });
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
      setIsMaximized(true);
    }
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

      <div className={styles.scene}>
        <div
          className={[
            styles.node,
            isPressed ? styles.pressed : "",
            isDragging ? styles.dragging : "",
            isMaximized ? styles.maximized : "",
          ].join(" ")}
          style={
            isMaximized
              ? undefined
              : {
                  transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                }
          }
        >
          <div className={styles.cuboid}>
            <div className={`${styles.face} ${styles.front}`}>
              {isMaximized ? (
                <div className={styles.maximizedFace}>
                  <header className={styles.titleBar}>
                    <button
                      type="button"
                      className={styles.restoreButton}
                      onClick={restoreCube}
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

                    <h2>The cube is maximized.</h2>

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
                    onContextMenu={(event) =>
                      event.preventDefault()
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        setIsMaximized(true);
                      }
                    }}
                  />
                </>
              )}
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

      {!isMaximized && (
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