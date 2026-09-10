import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Original empty configuration retained; candidate private-media paths need explicit tracing. */
  outputFileTracingIncludes: { "/review/assets/*": ["./private-media/**/*"] },
};

export default nextConfig;
