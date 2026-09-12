type DeploymentEnvironment = Record<string, string | undefined>;

export function isPublicProduction(
  environment: DeploymentEnvironment = process.env,
) {
  const vercelEnvironment = environment.VERCEL_ENV;
  const vercelTargetEnvironment = environment.VERCEL_TARGET_ENV;

  return (
    vercelEnvironment === "production" &&
    (!vercelTargetEnvironment || vercelTargetEnvironment === "production")
  );
}

export function publicRobotsPolicy(
  environment: DeploymentEnvironment = process.env,
) {
  return isPublicProduction(environment)
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true };
}

export function publicInquiryDeliveryEnabled(
  environment: DeploymentEnvironment = process.env,
) {
  return isPublicProduction(environment);
}
