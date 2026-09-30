"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import styles from "./HeaderLogoReview.module.css";

const LogoScene = dynamic(() => import("@/components/three/HeaderLogoScene"), { ssr: false });
class LogoBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

// Server build opt-in + loopback/query/input gates. Public/default stays static.
export function HeaderLogoReview({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLSpanElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => {
    if (!host) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine)");
    const selected = new URLSearchParams(location.search).get("header_logo") === "3d" && ["127.0.0.1", "localhost", "[::1]"].includes(location.hostname);
    let intersecting = true;
    const update = () => {
      const allowed = selected && intersecting && !document.hidden && !preference.matches && pointer.matches;
      setEnabled(allowed);
      if (!allowed) setReady(false);
    };
    update();
    preference.addEventListener("change", update);
    pointer.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    const observer = new IntersectionObserver(entries => { intersecting = entries[0].isIntersecting; update(); });
    observer.observe(host);
    return () => {
      preference.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      observer.disconnect();
    };
  }, [host]);
  const show = enabled && !failed;
  return <span ref={setHost} className={styles.slot} data-header-logo-review={show ? "3d" : "static"}>
    <span className={styles.fallback} style={{ opacity: show && ready ? 0 : 1 }}>{children}</span>
    {show && host && <span className={styles.scene} aria-hidden="true" style={{ opacity: ready ? 1 : 0 }}>
      <span className={styles.viewport}><LogoBoundary onFailure={onFailure}><LogoScene host={host} onReady={onReady} onFailure={onFailure} /></LogoBoundary></span>
    </span>}
  </span>;
}

// Previous SVG extrusion / pointer-tilt prototype retained as inactive restoration reference.
// "use client";
//
// import dynamic from "next/dynamic";
// import { Component, useEffect, useRef, useState, type ReactNode } from "react";
// import styles from "./HeaderLogoReview.module.css";
//
// const LogoScene = dynamic(() => import("@/components/three/HeaderLogoScene"), { ssr: false });
// class LogoBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
//   state = { failed: false };
//   static getDerivedStateFromError() { return { failed: true }; }
//   componentDidCatch() { this.props.onFailure(); }
//   render() { return this.state.failed ? null : this.props.children; }
// }
//
// // This component is included by Header only in development. The query switch is
// // additionally restricted to loopback hosts; no localStorage or global rollout.
// export function HeaderLogoReview({ children }: { children: ReactNode }) {
//   const root = useRef<HTMLSpanElement>(null);
//   const [enabled, setEnabled] = useState(false);
//   const [ready, setReady] = useState(false);
//   const [failed, setFailed] = useState(false);
//   const [active, setActive] = useState(false);
//   const [angle, setAngle] = useState<[number, number]>([0, 0]);
//   useEffect(() => {
//     const preference = matchMedia("(prefers-reduced-motion: reduce)");
//     const pointer = matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine)");
//     const selected = new URLSearchParams(location.search).get("header_logo") === "3d" && ["127.0.0.1", "localhost", "[::1]"].includes(location.hostname);
//     const update = () => { setEnabled(selected && !document.hidden && !preference.matches && pointer.matches); };
//     update(); preference.addEventListener("change", update); pointer.addEventListener("change", update);
//     const link = root.current?.closest("a");
//     const enter = () => { setActive(true); setAngle([-0.08, 0.12]); };
//     const leave = () => { setAngle([0, 0]); };
//     const move = (event: PointerEvent) => {
//       if (event.pointerType !== "mouse" || !link) return;
//       const box = link.getBoundingClientRect();
//       setAngle([-0.055 + (0.5 - (event.clientY - box.top) / box.height) * 0.12, 0.1 + ((event.clientX - box.left) / box.width - 0.5) * 0.16]);
//     };
//     link?.addEventListener("pointerenter", enter); link?.addEventListener("focus", enter);
//     link?.addEventListener("pointerleave", leave); link?.addEventListener("blur", leave); link?.addEventListener("pointermove", move);
//     const visible = () => { if (document.hidden) setActive(false); update(); };
//     document.addEventListener("visibilitychange", visible);
//     const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setActive(false); }) : null;
//     if (root.current) observer?.observe(root.current);
//     return () => {
//       preference.removeEventListener("change", update); pointer.removeEventListener("change", update);
//       link?.removeEventListener("pointerenter", enter); link?.removeEventListener("focus", enter);
//       link?.removeEventListener("pointerleave", leave); link?.removeEventListener("blur", leave); link?.removeEventListener("pointermove", move);
//       document.removeEventListener("visibilitychange", visible); observer?.disconnect();
//     };
//   }, []);
//   const show = enabled && !failed;
//   return <span ref={root} className={styles.slot} data-header-logo-review={show ? "3d" : "static"}>
//     <span className={styles.fallback} style={{ opacity: show && ready ? 0 : 1 }}>{children}</span>
//     {show && <span className={styles.scene} aria-hidden="true" style={{ opacity: ready ? 1 : 0 }}>
//       <LogoBoundary onFailure={() => setFailed(true)}><LogoScene angle={active ? angle : [0, 0]} onReady={() => setReady(true)} onFailure={() => setFailed(true)} onRest={() => { /* Demand rendering stops automatically at the resting pose. */ }} /></LogoBoundary>
//     </span>}
//   </span>;
// }
//
