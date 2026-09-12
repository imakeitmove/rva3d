import "server-only";

export function isAmsoilPrivatePreviewEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.RVA3D_ENABLE_PRIVATE_PREVIEWS === "1"
  );
}
