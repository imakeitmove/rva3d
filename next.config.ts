import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Original empty configuration retained; candidate private-media paths need explicit tracing. */
  // Previous candidate glob: "./private-media/**/*". Delivery keys are a flat allowlist.
  // Both routes receive the same prepared derivatives. Each route independently
  // authorizes access: public-approved registry entries or a signed review session.
  outputFileTracingIncludes: {
    "/media/*": ["./private-media/*"],
    "/review/assets/*": ["./private-media/*"],
  },
};

export default nextConfig;
