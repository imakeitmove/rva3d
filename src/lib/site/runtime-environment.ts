type DeploymentEnvironment = Record<string, string | undefined>;

export function publicInquiryDeliveryEnabled(
  environment: DeploymentEnvironment = process.env,
) {
  const vercelEnvironment = environment.VERCEL_ENV;
  const vercelTargetEnvironment = environment.VERCEL_TARGET_ENV;

  return (
    vercelEnvironment === "production" &&
    (!vercelTargetEnvironment || vercelTargetEnvironment === "production")
  );
}
