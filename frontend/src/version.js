// Auto-generated during build/deploy
export const APP_VERSION = "1.0.4";
export const BUILD_TIME = "19 Sept 2026, 12:14:25 am";

export const logVersion = () => {
  const env = process.env.REACT_APP_API_URL?.includes("dlws")
    ? "DLWS PROD"
    : process.env.REACT_APP_API_URL?.includes("dlps")
    ? "DLPS PROD"
    : "LOCAL DEV";

  const banner = `🚀 DLF Evaluation Portal | Version: v${APP_VERSION} | Build: ${BUILD_TIME} | Env: ${env}`;

  console.info(
    `%c${banner}`,
    "background: #2D5A27; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px; border: 1px solid #1e3f1a;"
  );

  console.log(
    `%c${banner}`,
    "background: #2D5A27; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px; border: 1px solid #1e3f1a;"
  );

  if (typeof window !== "undefined") {
    window.APP_VERSION = APP_VERSION;
    window.BUILD_TIME = BUILD_TIME;
    window.APP_ENV = env;
  }
};
