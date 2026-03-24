import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const scriptDirectory = dirname(__filename);
const dashboardRoot = resolve(scriptDirectory, "..");
const indexPath = join(dashboardRoot, "index.html");
const entryModulePath = join(dashboardRoot, "dist", "apps", "dashboard", "src", "main.js");

function getFlagValue(flagName) {
  const flagIndex = process.argv.indexOf(flagName);

  if (flagIndex === -1) {
    return undefined;
  }

  return process.argv[flagIndex + 1];
}

function getContentType(filePath) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".map":
      return "application/json; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}

function buildDashboardServeSummary(port) {
  return [
    `Dashboard ready: http://localhost:${port}`,
    `Index: ${indexPath}`,
    `Entry: ${entryModulePath}`
  ];
}

function assertDashboardArtifacts() {
  if (!existsSync(indexPath)) {
    throw new Error(`Dashboard index was not found: ${indexPath}`);
  }

  if (!existsSync(entryModulePath)) {
    throw new Error(`Dashboard entry module was not found. Run "npm run dashboard:build" first: ${entryModulePath}`);
  }
}

function createDashboardServer() {
  return createServer((request, response) => {
    const requestPath = request.url ? request.url.split("?")[0] : "/";
    const relativePath = requestPath === "/" ? "/index.html" : requestPath;
    const safeRelativePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = resolve(dashboardRoot, `.${safeRelativePath}`);

    if (!filePath.startsWith(dashboardRoot)) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": getContentType(filePath) });
    response.end(readFileSync(filePath));
  });
}

const portValue = Number(getFlagValue("--port") ?? "4173");
const checkOnly = process.argv.includes("--check");

assertDashboardArtifacts();

if (checkOnly) {
  console.log(buildDashboardServeSummary(portValue).join("\n"));
  process.exit(0);
}

const server = createDashboardServer();

server.listen(portValue, () => {
  console.log(buildDashboardServeSummary(portValue).join("\n"));
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});
