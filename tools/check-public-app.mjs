import { existsSync, readFileSync } from "node:fs";
import { normalizeOpsSnapshot } from "../lib/snapshot.js";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const layout = readFileSync("app/layout.jsx", "utf8");
const dashboardPage = readFileSync("app/page.jsx", "utf8");
const servicePage = readFileSync("app/services/page.jsx", "utf8");
const knowledgePage = readFileSync("app/knowledge/page.jsx", "utf8");
const appShell = readFileSync("components/AppShell.jsx", "utf8");
const metricStrip = readFileSync("components/MetricStrip.jsx", "utf8");
const dashboardView = readFileSync("components/dashboard/DashboardView.jsx", "utf8");
const knowledgeView = readFileSync("components/knowledge/KnowledgeDatabaseView.jsx", "utf8");
const serviceRegistry = readFileSync("components/service/ServiceRegistry.jsx", "utf8");
const portPolicy = readFileSync("components/service/PortPolicy.jsx", "utf8");
const snapshotSource = readFileSync("lib/snapshot.js", "utf8");
const liveSnapshotSource = readFileSync("lib/live-snapshot.js", "utf8");
const css = readFileSync("public/assets/app.css", "utf8");
const servicesCss = readFileSync("public/assets/services.css", "utf8");
const snapshot = normalizeOpsSnapshot(JSON.parse(readFileSync("public/data/ops-snapshot.json", "utf8")));

const requiredNextFiles = [
  "app/layout.jsx",
  "app/page.jsx",
  "app/services/page.jsx",
  "app/knowledge/page.jsx",
  "components/AppShell.jsx",
  "components/MetricStrip.jsx",
  "components/dashboard/DashboardView.jsx",
  "components/knowledge/KnowledgeDatabaseView.jsx",
  "components/service/ServiceRegistry.jsx",
  "lib/snapshot.js",
  "lib/live-snapshot.js",
  "next.config.mjs",
  "Dockerfile",
  "tools/prepare-standalone-assets.mjs",
];

const requiredAppText = [
  "app-shell",
  "metric-strip--status",
  "Dashboard",
  "Service",
  "VectorDB",
];

const requiredServiceText = [
  "service-category-filter",
  "service-search-button",
  "port-policy-list",
  "Host/systemd",
];

const requiredCss = [
  ".metric-strip",
  ".metric-card--ok",
  ".filter-bar--service",
  ".status-chart-grid",
  ".upload-file-list",
  ".service-table th:first-child",
  ".state-pill i",
  "@media (max-width: 900px)",
];

const requiredDashboardText = [
  "resource-readout-grid",
  "status-chart-grid",
  "pie-chart",
];

const requiredKnowledgeText = [
  "KnowledgeDatabaseView",
  "VectorDB 관리",
  "filter-bar--knowledge",
  "문서 업로드",
];

const requiredServiceRegistryText = [
  "filterServices",
  "category",
  "service-status-dot",
];

const requiredServicesCss = [
  ".service-status-dot",
  ".service-empty-row",
];

const secretPatterns = [
  /api[_-]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /token\s*[:=]/i,
  /password\s*[:=]/i,
  /AKIA[0-9A-Z]{16}/,
  /BEGIN (RSA|OPENSSH|PRIVATE) KEY/,
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const filePath of requiredNextFiles) {
  assert(existsSync(filePath), `${filePath} must exist`);
}

assert(!existsSync("public/index.html"), "public/index.html must not conflict with Next root route");
assert(packageJson.scripts.dev.includes("next dev"), "dev script must use next dev");
assert(packageJson.scripts.build.includes("next build"), "build script must use next build");
assert(packageJson.scripts.start.includes(".next/standalone/server.js"), "start script must use Next standalone server");

const appText = [layout, dashboardPage, servicePage, knowledgePage, appShell, metricStrip].join("\n");
for (const needle of requiredAppText) {
  assert(appText.includes(needle), `Next app shell missing ${needle}`);
}

const serviceText = [servicePage, serviceRegistry, portPolicy].join("\n");
for (const needle of requiredServiceText) {
  assert(serviceText.includes(needle), `Service app missing ${needle}`);
}

for (const needle of requiredCss) {
  assert(css.includes(needle), `public/assets/app.css missing ${needle}`);
}

for (const needle of requiredDashboardText) {
  assert(dashboardView.includes(needle), `Dashboard component missing ${needle}`);
}

for (const needle of requiredKnowledgeText) {
  const source = needle === "VectorDB 관리" || needle === "KnowledgeDatabaseView" ? knowledgePage : knowledgeView;
  assert(source.includes(needle), `Knowledge component missing ${needle}`);
}

for (const needle of requiredServiceRegistryText) {
  assert(serviceRegistry.includes(needle), `Service component missing ${needle}`);
}

for (const needle of requiredServicesCss) {
  assert(servicesCss.includes(needle), `public/assets/services.css missing ${needle}`);
}

assert(Array.isArray(snapshot.services) && snapshot.services.length === 10, "snapshot services length must be 10");
assert(Array.isArray(snapshot.documents) && snapshot.documents.length === 8, "snapshot documents length must be 8");
assert(Array.isArray(snapshot.uploadFiles) && snapshot.uploadFiles.length === 4, "snapshot uploadFiles length must be 4");
assert(snapshot.services.every((service) => service.name && service.status && service.runtime), "invalid service row");
assert(snapshot.services.some((service) => service.runtime === "Host/systemd"), "snapshot must include Host/systemd services");
assert(snapshot.documents.every((document) => document.name && document.status && document.source), "invalid document row");
assert(snapshot.overview.resourceStatus.status === "warn", "resource overview should be derived as warn");
assert(snapshot.overview.serviceStatus.status === "warn", "service overview should reflect warn/unknown service rows");
assert(snapshot.resources.find((resource) => resource.label === "Memory")?.status === "warn", "80% memory should be warn, not error");
assert(snapshot.resources.find((resource) => resource.label === "HDD Data")?.status === "ok", "41% HDD should be ok");
assert(!dashboardView.includes("30초 전"), "dashboard must not show fake 30-second refresh data");
assert(!dashboardView.includes("스케줄 정상률"), "dashboard must not show hard-coded automation schedule rate");
assert(snapshotSource.includes("getLiveOpsSnapshot"), "runtime snapshot must use live collector before fallback");
assert(liveSnapshotSource.includes("OPS_CONSOLE_COLLECTOR"), "live collector must support collector mode env");
assert(liveSnapshotSource.includes("docker ps"), "live collector must inspect Docker containers");
assert(liveSnapshotSource.includes("systemctl is-active"), "live collector must inspect systemd services");
assert(liveSnapshotSource.includes("systemctl --user is-active"), "live collector must inspect user systemd services");
assert(liveSnapshotSource.includes("journalctl"), "live collector must inspect host logs");
assert(liveSnapshotSource.includes('checks.includes("error")'), "service status aggregation must not hide failed checks behind open ports");
assert(snapshot.services.find((service) => service.name === "Ops Console")?.runtime === "Host/systemd", "Ops Console should be deployed as a host service for live host metrics");
assert(existsSync("deploy/run-ops-console-host.sh"), "host systemd deploy script must exist");
assert(packageJson.scripts.start.includes("prepare:standalone"), "start script must prepare standalone static assets");
assert(existsSync("public/design-kit/pages/dashboard.html"), "public design-kit dashboard page must be synced");
assert(existsSync("public/design-kit/pages/service.html"), "public design-kit service page must be synced");
assert(existsSync("public/design-kit/pages/knowledge.html"), "public design-kit knowledge page must be synced");

const joined = [
  layout,
  dashboardPage,
  servicePage,
  appShell,
  metricStrip,
  dashboardView,
  knowledgePage,
  knowledgeView,
  serviceRegistry,
  portPolicy,
  snapshotSource,
  liveSnapshotSource,
  css,
  servicesCss,
  JSON.stringify(snapshot),
].join("\n");
for (const pattern of secretPatterns) {
  assert(!pattern.test(joined), `secret-like pattern found: ${pattern}`);
}

console.log("PUBLIC_APP_CHECK: PASS");
