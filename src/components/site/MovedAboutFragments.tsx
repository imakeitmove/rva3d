"use client";

import { useEffect } from "react";

const movedFragments = new Map([
  ["#how-we-work", "./about#process"],
  ["#faq", "./faq#faq"],
]);

export function MovedAboutFragments({ faq = false }: { faq?: boolean }) {
  useEffect(() => {
    const replaceMovedFragment = () => {
      // The permanent legacy redirect preserves its fragment in the browser.
      const destination = faq
        ? (["#process", "#working-together", "#communication", "#how-we-work"].includes(window.location.hash) ? "./about" + (window.location.hash === "#how-we-work" ? "#process" : window.location.hash) : undefined)
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
        Looking for <a href="./about#process">our process</a> or the{" "}
        <a href="./faq#faq">project FAQ</a>?
      </p>
    </noscript>
  );
}
