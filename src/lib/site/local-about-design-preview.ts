// Trusted server/launcher opt-in only. Requests, cookies and NODE_ENV cannot
// enable this exception. All deployment/release signals override the local flag.
export function localAboutDesignPreviewEnabled(
  environment: Record<string, string | undefined> = process.env,
) {
  return environment.RVA3D_LOCAL_ABOUT_DESIGN_PREVIEW === "1" &&
    !["VERCEL", "VERCEL_ENV", "VERCEL_TARGET_ENV", "VERCEL_URL", "VERCEL_PROJECT_ID", "CI"]
      .some(name => Boolean(environment[name]));
}
