"use client";

import type {
  CSSProperties,
  MouseEvent,
  PointerEvent,
  PointerEventHandler,
} from "react";

import styles from "./RevealDivider.module.css";

export type RevealSide = "left" | "right";

type RevealDividerProps = {
  attention?: boolean;
  className?: string;
  disabled?: boolean;
  dragging?: boolean;
  interactive?: boolean;
  label?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerCancel?: PointerEventHandler<HTMLButtonElement>;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
  onPointerMove?: PointerEventHandler<HTMLButtonElement>;
  onPointerUp?: PointerEventHandler<HTMLButtonElement>;
  onLostPointerCapture?: (event: PointerEvent<HTMLButtonElement>) => void;
  position?: string;
  side: RevealSide;
};

function Arrow({ side }: { side: RevealSide }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d={side === "left" ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"}
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="2"
      />
    </svg>
  );
}

export function RevealDivider({
  attention = false,
  className,
  disabled = false,
  dragging = false,
  interactive = false,
  label,
  onClick,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  position,
  side,
}: RevealDividerProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");
  const style = position
    ? ({ "--divider-position": position } as CSSProperties)
    : undefined;

  return (
    <div
      aria-hidden={interactive ? undefined : true}
      className={rootClassName}
      data-attention={attention ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      data-interactive={interactive ? "true" : "false"}
      data-reveal-side={side}
      style={style}
    >
      <span className={styles.line} />
      {interactive ? (
        <button
          aria-label={label}
          className={styles.hitTarget}
          disabled={disabled}
          onClick={onClick}
          onLostPointerCapture={onLostPointerCapture}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          type="button"
        >
          <span className={styles.handle}>
            <Arrow side={side} />
          </span>
        </button>
      ) : (
        <span className={styles.passiveHandle}>
          <span className={styles.handle}>
            <Arrow side={side} />
          </span>
        </span>
      )}
    </div>
  );
}
