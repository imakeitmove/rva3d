"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSceneModeForPathname } from "@/lib/routeSceneMap";
import { useAppState } from "@/state/useAppState";

export function RouteSceneSync() {
  const pathname = usePathname();
  const mode = useAppState((s) => s.mode);
  const setMode = useAppState((s) => s.setMode);

  useEffect(() => {
    const nextMode = getSceneModeForPathname(pathname);
    if (nextMode !== mode) {
      setMode(nextMode);
    }
  }, [pathname, mode, setMode]);

  return null;
}
