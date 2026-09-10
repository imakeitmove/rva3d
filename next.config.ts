import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Original empty configuration retained; candidate private-media paths need explicit tracing. */
  // Previous candidate glob: "./private-media/**/*". Delivery keys are a flat allowlist.
  // Only this authenticated route receives the prepared private delivery files.
  outputFileTracingIncludes: { "/review/assets/*": ["./private-media/*"] },
};

export default nextConfig;
