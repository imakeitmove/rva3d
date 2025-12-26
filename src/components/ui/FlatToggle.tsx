"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/state/useAppState";

const STORAGE_KEY = "rva3d-flat-mode";

export function FlatToggle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flatMode = useAppState((s) => s.flatMode);
  const setFlatMode = useAppState((s) => s.setFlatMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const queryFlat = searchParams.get("flat");
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const nextFlat = queryFlat === "1" || stored === "1";
    setFlatMode(nextFlat);
    setHydrated(true);
  }, [searchParams, setFlatMode]);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, flatMode ? "1" : "0");
    }

    const current = new URLSearchParams(searchParams.toString());
    if (flatMode) {
      current.set("flat", "1");
    } else {
      current.delete("flat");
    }
    router.replace(`?${current.toString()}`, { scroll: false });
  }, [flatMode, hydrated, searchParams, router]);

  return (
    <button
      type="button"
      onClick={() => setFlatMode(!flatMode)}
      aria-pressed={flatMode}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.3)",
        background: flatMode ? "rgba(96,165,250,0.25)" : "rgba(0,0,0,0.5)",
        color: "#f5f5f5",
        cursor: "pointer",
        fontSize: 14,
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.5)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {flatMode ? "Disable Flat mode" : "Enable Flat mode"}
    </button>
  );
}
