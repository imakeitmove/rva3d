"use client";

import { useEffect } from "react";

const movedFragments = new Map([
  ["#how-we-work", "./how-we-work#process"],
  ["#faq", "./how-we-work#faq"],
]);

export function MovedAboutFragments() {
  useEffect(() => {
    const replaceMovedFragment = () => {
      const destination = movedFragments.get(window.location.hash);
      if (destination) {
        window.location.replace(new URL(destination, window.location.href));
      }
    };

    replaceMovedFragment();
    window.addEventListener("hashchange", replaceMovedFragment);
    return () => window.removeEventListener("hashchange", replaceMovedFragment);
  }, []);

  return (
    <noscript>
      <p className="moved-fragment-fallback">
        Looking for <a href="./how-we-work#process">our process</a> or the{" "}
        <a href="./how-we-work#faq">project FAQ</a>?
      </p>
    </noscript>
  );
}
