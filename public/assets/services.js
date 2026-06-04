export const SERVICE_STATUS_LABELS = {
  ok: "정상",
  warn: "주의",
  error: "에러",
  unknown: "미확인",
};

const DEFAULT_FILTERS = {
  query: "",
  status: "all",
  runtime: "all",
  category: "all",
};

const SERVICE_COLUMN_COUNT = 6;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeStatus(status) {
  return SERVICE_STATUS_LABELS[status] ? status : "unknown";
}

function escapeHtml(value) {
  return normalizeText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getFilterValue(filters, key) {
  const value = normalizeText(filters?.[key]);
  return value || DEFAULT_FILTERS[key];
}

function getQueryFilter(filters) {
  return normalizeText(filters?.query || filters?.search).toLowerCase();
}

function serviceSearchText(service = {}) {
  return [
    service.name,
    service.description,
    service.status,
    service.runtime,
    service.category,
    service.port,
    service.process,
  ]
    .map((value) => normalizeText(value).toLowerCase())
    .join(" ");
}

function formatCell(value) {
  const text = normalizeText(value);
  return text || "-";
}

function statusClass(status) {
  return `status-${normalizeStatus(status)}`;
}

function renderStatusPill(status) {
  const normalized = normalizeStatus(status);
  return `
    <span class="state-pill service-status-pill service-status-pill--${normalized} ${statusClass(normalized)}" data-service-status="${normalized}">
      <i class="service-status-dot" aria-hidden="true"></i>
      <span class="service-status-label">${SERVICE_STATUS_LABELS[normalized]}</span>
    </span>
  `;
}

function renderServiceRow(service) {
  const name = formatCell(service.name);
  const description = normalizeText(service.description);

  return `
    <tr class="service-row" data-service-status="${escapeHtml(normalizeStatus(service.status))}" data-service-runtime="${escapeHtml(formatCell(service.runtime))}">
      <td data-label="서비스">
        <span class="name-cell service-name-cell">
          <strong>${escapeHtml(name)}</strong>
          <em>${escapeHtml(description)}</em>
        </span>
      </td>
      <td data-label="상태">${renderStatusPill(service.status)}</td>
      <td data-label="실행 방식">${escapeHtml(formatCell(service.runtime))}</td>
      <td data-label="분류">${escapeHtml(formatCell(service.category))}</td>
      <td data-label="포트">${escapeHtml(formatCell(service.port))}</td>
      <td data-label="프로세스">${escapeHtml(formatCell(service.process))}</td>
    </tr>
  `;
}

function renderEmptyRow() {
  return `<tr class="service-row service-row--empty"><td class="empty-row service-empty-row" colspan="${SERVICE_COLUMN_COUNT}">조건에 맞는 서비스가 없습니다.</td></tr>`;
}

function resolveRoot(root) {
  if (typeof root === "string") {
    if (typeof document === "undefined") return null;
    return document.querySelector(root);
  }
  return root;
}

export function filterServices(services = [], filters = {}) {
  const query = getQueryFilter(filters);
  const status = getFilterValue(filters, "status");
  const runtime = getFilterValue(filters, "runtime");
  const category = getFilterValue(filters, "category");
  const source = Array.isArray(services) ? services : [];

  return source.filter((service = {}) => {
    const matchesQuery = !query || serviceSearchText(service).includes(query);
    const matchesStatus = status === "all" || service.status === status;
    const matchesRuntime = runtime === "all" || service.runtime === runtime;
    const matchesCategory = category === "all" || service.category === category;
    return matchesQuery && matchesStatus && matchesRuntime && matchesCategory;
  });
}

export function renderServices({ snapshot, root, filters = {} } = {}) {
  const target = resolveRoot(root);
  if (!target) {
    throw new Error("renderServices requires a root element or selector.");
  }

  const services = Array.isArray(snapshot?.services) ? snapshot.services : [];
  const rows = filterServices(services, filters);
  target.innerHTML = rows.length ? rows.map(renderServiceRow).join("") : renderEmptyRow();

  return {
    total: services.length,
    visible: rows.length,
  };
}
