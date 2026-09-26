"use client";

import { useEffect, type RefObject } from "react";

const INTENT_EVENT = "rva-case-media-intent";
const REVEAL_MS = 4000;

/** Progressive enhancement for existing case-study controls; never changes playback. */
export function useMediaChrome<T extends HTMLElement>(targetRef: RefObject<T | null>, { enabled = true, viewer = false }: { enabled?: boolean; viewer?: boolean } = {}) {
  useEffect(() => {
    const target = targetRef.current;
    // Shared capability/homepage consumers retain their current behavior.
    if (!enabled || !target || (!viewer && !target.closest("article"))) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let contact: { x: number; y: number; hidden: boolean } | null = null;
    let suppressClickUntil = 0;
    target.dataset.mediaChrome = "quiet";
    if (viewer) target.dataset.mediaViewer = "true";
    const hide = () => { clearTimeout(timer); delete target.dataset.mediaIntent; };
    const reveal = () => {
      clearTimeout(timer);
      target.dataset.mediaIntent = "active";
      document.dispatchEvent(new CustomEvent(INTENT_EVENT, { detail: target }));
      timer = setTimeout(hide, REVEAL_MS);
    };
    const isolate = (event: Event) => {
      if ((event as CustomEvent).detail !== target) hide();
    };
    const down = (event: PointerEvent) => {
      target.dataset.mediaPointer = event.pointerType;
      if (event.pointerType !== "mouse") {
        contact = { x: event.clientX, y: event.clientY, hidden: !target.dataset.mediaIntent };
        if (!contact.hidden) suppressClickUntil = 0;
      } else reveal();
    };
    const up = (event: PointerEvent) => {
      if (!contact) return;
      const tap = Math.hypot(event.clientX - contact.x, event.clientY - contact.y) < 12;
      if (tap) {
        // First touch reveals; it must not activate a control that was invisible.
        // Native video transport remains owned by the browser for accessibility.
        if (contact.hidden && !(event.target instanceof Element && event.target.closest("video[controls], [data-media-persistent]"))) suppressClickUntil = performance.now() + 500;
        reveal();
      }
      contact = null;
    };
    const cancel = () => { contact = null; };
    const click = (event: MouseEvent) => {
      if (event.detail !== 0 && performance.now() < suppressClickUntil) { suppressClickUntil = 0; event.preventDefault(); event.stopPropagation(); return; }
      reveal();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") { target.dataset.mediaPointer = "mouse"; reveal(); }
    };
    const keyboard = () => { target.dataset.mediaPointer = "keyboard"; reveal(); };
    const full = () => { if (document.fullscreenElement === target) reveal(); };
    target.addEventListener("pointerdown", down);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", cancel);
    target.addEventListener("pointermove", move);
    target.addEventListener("click", click, true);
    target.addEventListener("keydown", keyboard);
    document.addEventListener(INTENT_EVENT, isolate);
    document.addEventListener("fullscreenchange", full);
    return () => {
      hide();
      target.removeEventListener("pointerdown", down);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", cancel);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("click", click, true);
      target.removeEventListener("keydown", keyboard);
      document.removeEventListener(INTENT_EVENT, isolate);
      document.removeEventListener("fullscreenchange", full);
      delete target.dataset.mediaChrome;
      delete target.dataset.mediaPointer;
      delete target.dataset.mediaViewer;
    };
  }, [targetRef, enabled, viewer]);
}
