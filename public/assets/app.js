import { renderDashboard } from "./dashboard.js";
import { populateKnowledgeSources, renderKnowledge, renderUploadFiles } from "./knowledge.js";
import { renderServices as renderServiceTable } from "./services.js";

const stateLabels = {
  ok: "정상",
  warn: "주의",
  error: "에러",
  unknown: "미확인",
  loaded: "적재",
  vector: "벡터",
  failed: "실패",
  info: "정보",
};

const routes = {
  dashboard: {
    kicker: "Admin Overview",
    title: "PLOZEN 운영 Dashboard",
    description: "13번 서버의 컴퓨팅 자원, 서비스, 자동화 상태를 시스템 관리자 관점에서 확인합니다.",
  },
  services: {
    kicker: "Service Registry",
    title: "Service 상태",
    description: "Docker 컨테이너와 Host/systemd 서비스를 한 목록에서 확인합니다.",
  },
  knowledge: {
    kicker: "VectorDB",
    title: "VectorDB 관리",
    description: "VectorDB 문서 적재 상태, 조각 수, 벡터 생성 여부를 확인합니다.",
  },
};

const appState = {
  snapshot: null,
  route: "dashboard",
};

function getStatusClass(status) {
  if (status === "ok" || status === "vector") return "status-ok";
  if (status === "warn" || status === "loaded") return "status-warn";
  if (status === "error" || status === "failed") return "status-error";
  return "status-unknown";
}

function metricClass(status) {
  if (status === "ok" || status === "vector") return "metric-card--ok";
  if (status === "warn" || status === "loaded") return "metric-card--warn";
  if (status === "error" || status === "failed") return "metric-card--critical";
  if (status === "unknown") return "metric-card--unknown";
  return "metric-card--info";
}

function formatSnapshotTime(value) {
  if (!value) return "snapshot unavailable";
  return `기준 ${value}`;
}

function setRoute(route) {
  appState.route = routes[route] ? route : "dashboard";
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === appState.route);
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === appState.route);
  });

  const meta = routes[appState.route];
  document.querySelector("#page-kicker").textContent = meta.kicker;
  document.querySelector("#page-title").textContent = meta.title;
  document.querySelector("#page-description").textContent = meta.description;
  renderMetrics();
}

function renderMetrics() {
  const snapshot = appState.snapshot;
  if (!snapshot) return;

  const metricsByRoute = {
    dashboard: [
      { label: "Resource", value: snapshot.overview.resourceStatus.label, status: snapshot.overview.resourceStatus.status },
      { label: "Service", value: snapshot.overview.serviceStatus.label, status: snapshot.overview.serviceStatus.status },
      { label: "Automation", value: snapshot.overview.automationStatus.label, status: snapshot.overview.automationStatus.status },
      { label: "Log", value: snapshot.overview.logStatus.label, status: snapshot.overview.logStatus.status },
    ],
    services: [
      { label: "정상", value: `${snapshot.serviceSummary.ok}개`, status: "ok" },
      { label: "주의", value: `${snapshot.serviceSummary.warn}개`, status: "warn" },
      { label: "에러", value: `${snapshot.serviceSummary.error}개`, status: "error" },
      { label: "미확인", value: `${snapshot.serviceSummary.unknown}개`, status: "unknown" },
    ],
    knowledge: [
      { label: "전체 문서", value: snapshot.knowledgeSummary.total, status: "unknown" },
      { label: "적재", value: snapshot.knowledgeSummary.loaded, status: "warn" },
      { label: "벡터", value: snapshot.knowledgeSummary.vector, status: "ok" },
      { label: "실패", value: snapshot.knowledgeSummary.failed, status: "error" },
    ],
  };

  const items = metricsByRoute[appState.route];
  document.querySelector("#metric-strip").innerHTML = items
    .map(
      (item) => `
        <div class="metric-card ${metricClass(item.status)}">
          <dt>${item.label}</dt>
          <dd>${item.value}</dd>
        </div>
      `,
    )
    .join("");
}

function renderPortPolicy() {
  document.querySelector("#port-policy-list").innerHTML = appState.snapshot.portPolicy
    .map((item) => `<li><strong>${item.range}</strong><span>${item.description}</span></li>`)
    .join("");
}

function getServiceFilters() {
  return {
    query: document.querySelector("#service-query").value,
    status: document.querySelector("#service-status-filter").value,
    runtime: document.querySelector("#service-runtime-filter").value,
    category: document.querySelector("#service-category-filter").value,
  };
}

function renderServiceView() {
  renderServiceTable({
    snapshot: appState.snapshot,
    root: document.querySelector("#service-rows"),
    filters: getServiceFilters(),
  });
}

function getKnowledgeFilters() {
  return {
    query: document.querySelector("#knowledge-query").value,
    status: document.querySelector("#knowledge-status-filter").value,
    type: document.querySelector("#knowledge-type-filter").value,
    source: document.querySelector("#knowledge-source-filter").value,
  };
}

function renderKnowledgeView() {
  renderKnowledge({
    documents: appState.snapshot?.documents || [],
    tbody: document.querySelector("#knowledge-rows"),
    pagination: document.querySelector("#knowledge-pagination-count"),
    filters: getKnowledgeFilters(),
    stateLabels,
    getStatusClass,
  });
}

function renderAll() {
  document.querySelector("#snapshot-time").textContent = formatSnapshotTime(appState.snapshot.snapshotDate);
  renderMetrics();
  renderDashboard({
    snapshot: appState.snapshot,
    root: document.querySelector("#dashboard-panel"),
  });
  renderServiceView();
  renderPortPolicy();
  populateKnowledgeSources({
    documents: appState.snapshot.documents,
    select: document.querySelector("#knowledge-source-filter"),
  });
  renderKnowledgeView();
  renderUploadFiles({
    files: appState.snapshot.uploadFiles,
    root: document.querySelector("#upload-file-list"),
  });
}

async function loadSnapshot() {
  const response = await fetch("./data/ops-snapshot.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`snapshot request failed: ${response.status}`);
  appState.snapshot = await response.json();
  renderAll();
  setRoute(location.hash.replace("#", "") || "dashboard");
}

function bindEvents() {
  window.addEventListener("hashchange", () => setRoute(location.hash.replace("#", "")));
  document.querySelector("#refresh-button").addEventListener("click", loadSnapshot);
  ["#service-query", "#service-status-filter", "#service-runtime-filter", "#service-category-filter"].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", renderServiceView);
  });
  document.querySelector("#service-search-button").addEventListener("click", renderServiceView);
  ["#knowledge-query", "#knowledge-status-filter", "#knowledge-type-filter", "#knowledge-source-filter"].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", renderKnowledgeView);
  });
  document.querySelector("#knowledge-search-button").addEventListener("click", renderKnowledgeView);
}

bindEvents();
loadSnapshot().catch((error) => {
  document.querySelector("#snapshot-time").textContent = "snapshot error";
  document.querySelector("#metric-strip").innerHTML = `
    <div class="metric-card metric-card--critical"><dt>Data</dt><dd>오류</dd></div>
    <div class="metric-card metric-card--info"><dt>Service</dt><dd>-</dd></div>
    <div class="metric-card metric-card--info"><dt>VectorDB</dt><dd>-</dd></div>
    <div class="metric-card metric-card--info"><dt>Automation</dt><dd>-</dd></div>
  `;
  console.error(error);
});
