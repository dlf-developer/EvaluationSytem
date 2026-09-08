const fs = require("fs");
const path = require("path");

const versionFilePath = path.join(__dirname, "src", "version.js");
const pkg = require("./package.json");

const now = new Date();
const formattedTime = now.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "medium",
});

const content = `// Auto-generated during build/deploy
export const APP_VERSION = "${pkg.version || "1.0.2"}";
export const BUILD_TIME = "${formattedTime}";

export const logVersion = () => {
  const env = process.env.REACT_APP_API_URL?.includes("dlws")
    ? "DLWS PROD"
    : process.env.REACT_APP_API_URL?.includes("dlps")
    ? "DLPS PROD"
    : "LOCAL DEV";

  const banner = \`🚀 DLF Evaluation Portal | Version: v\${APP_VERSION} | Build: \${BUILD_TIME} | Env: \${env}\`;

  console.info(
    \`%c\${banner}\`,
    "background: #2D5A27; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px; border: 1px solid #1e3f1a;"
  );

  console.log(
    \`%c\${banner}\`,
    "background: #2D5A27; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px; border: 1px solid #1e3f1a;"
  );

  if (typeof window !== "undefined") {
    window.APP_VERSION = APP_VERSION;
    window.BUILD_TIME = BUILD_TIME;
    window.APP_ENV = env;
  }
};
`;

fs.writeFileSync(versionFilePath, content, "utf8");
console.log(`[Version Tracker] Updated version: v${pkg.version} (${formattedTime})`);
