"use client";

import { useEffect } from "react";

// Preserve prior inbound anchors as the process moves back to FAQ.
const movedFragments = new Map([
  ["#how-we-work", "./faq#process"],
  ["#process", "./faq#process"],
  ["#working-together", "./faq#working-together"],
  ["#faq", "./faq#faq"],
]);

export function MovedAboutFragments({ faq = false }: { faq?: boolean }) {
  useEffect(() => {
    const replaceMovedFragment = () => {
      // The permanent legacy redirect preserves its fragment in the browser.
      const destination = faq
        ? (window.location.hash === "#communication" ? "./about#communication" : window.location.hash === "#how-we-work" ? "./faq#process" : undefined)
        : movedFragments.get(window.location.hash);
      if (destination) {
        window.location.replace(new URL(destination, window.location.href));
      }
    };

    replaceMovedFragment();
    window.addEventListener("hashchange", replaceMovedFragment);
    return () => window.removeEventListener("hashchange", replaceMovedFragment);
  }, [faq]);

  return (
    <noscript>
      <p className="moved-fragment-fallback">
        Looking for <a href="./faq#process">our process</a> or the{" "}
        <a href="./faq#faq">project FAQ</a>?
      </p>
    </noscript>
  );
}
