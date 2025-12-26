export type SceneMode = "intro" | "sandbox" | "portal" | "work" | "services";

export function getSceneModeForPathname(pathname: string | null): SceneMode {
  if (!pathname) return "intro";
  if (pathname.startsWith("/portal")) return "portal";
  if (pathname.startsWith("/sandbox")) return "sandbox";
  if (pathname.startsWith("/work")) return "work";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/portfolio")) return "work";
  // default marketing landing
  return "intro";
}
