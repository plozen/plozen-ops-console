const DASH_PLACEHOLDER = "-";

const STATUS_CLASS = {
  ok: "status-ok",
  warn: "status-warn",
  error: "status-error",
  unknown: "status-unknown",
};

const STATUS_LABEL = {
  ok: "정상",
  warn: "주의",
  error: "에러",
  unknown: "미확인",
};

function escapeHtml(value) {
  return String(value ?? DASH_PLACEHOLDER)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") {
    return DASH_PLACEHOLDER;
  }

  return value;
}

function toCount(value) {
  if (Number.isFinite(value)) {
    return `${value}개`;
  }

  if (Number.isFinite(Number(value))) {
    return `${Number(value)}개`;
  }

  return DASH_PLACEHOLDER;
}

function toRunCount(value) {
  if (Number.isFinite(value)) {
    return `${value}회`;
  }

  if (Number.isFinite(Number(value))) {
    return `${Number(value)}회`;
  }

  return DASH_PLACEHOLDER;
}

function toCaseCount(value) {
  if (Number.isFinite(value)) {
    return `${value}건`;
  }

  if (Number.isFinite(Number(value))) {
    return `${Number(value)}건`;
  }

  return DASH_PLACEHOLDER;
}

function clampPercent(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numeric));
}

function resolveRoot(root) {
  if (typeof root === "string") {
    return typeof document === "undefined" ? null : document.querySelector(root);
  }

  return root && typeof root.innerHTML === "string" ? root : null;
}

function getStatusClass(status) {
  return STATUS_CLASS[status] ?? STATUS_CLASS.unknown;
}

function getStatusLabel(status) {
  return STATUS_LABEL[status] ?? STATUS_LABEL.unknown;
}

function getArray(value) {
  return Array.isArray(value) ? value : [];
}

function summaryValue(source, key, formatter = toCount) {
  return formatter(source?.[key]);
}

function renderEmptyResourceTiles() {
  return `
    <div class="resource-readout resource-readout--unknown" role="status">
      <span>Snapshot</span>
      <strong>${DASH_PLACEHOLDER}</strong>
      <em>표시할 자원 데이터가 없습니다.</em>
      <i style="--value: 0%"></i>
    </div>
  `;
}

function renderResourceTiles(resources) {
  if (resources.length === 0) {
    return renderEmptyResourceTiles();
  }

  return resources
    .map((item) => {
      const status = item?.status ?? "unknown";
      const percent = clampPercent(item?.percent);

      return `
        <div class="resource-readout resource-readout--${escapeHtml(status)} ${getStatusClass(status)}">
          <span>${escapeHtml(valueOrDash(item?.label))}</span>
          <strong title="${escapeHtml(valueOrDash(item?.value))}">${escapeHtml(valueOrDash(item?.value))}</strong>
          <em>${escapeHtml(valueOrDash(item?.note))}</em>
          <i aria-label="${escapeHtml(getStatusLabel(status))} ${percent}%" style="--value: ${percent}%"></i>
        </div>
      `;
    })
    .join("");
}

function numberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parsePercent(value) {
  const numeric = Number(String(value ?? "").replace("%", ""));
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0;
}

function renderLegendRows(rows) {
  return rows
    .map(
      (row) => `
        <div>
          <dt>${escapeHtml(row.label)}</dt>
          <dd>${escapeHtml(row.value)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderPiePanel({ eyebrow, title, chartClass, chartStyle, chartLabel, chartValue, chartCaption, rows }) {
  return `
    <article class="chart-panel">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
      </header>
      <div class="pie-summary">
        <div class="pie-chart ${escapeHtml(chartClass)}" role="img" aria-label="${escapeHtml(chartLabel)}" style="${escapeHtml(chartStyle)}">
          <strong>${escapeHtml(chartValue)}</strong>
          <span>${escapeHtml(chartCaption)}</span>
        </div>
        <dl class="chart-legend">${renderLegendRows(rows)}</dl>
      </div>
    </article>
  `;
}

function buildServiceChart(snapshot) {
  const service = snapshot?.serviceSummary;
  const ok = numberOrZero(service?.ok);
  const warn = numberOrZero(service?.warn);
  const error = numberOrZero(service?.error);
  const unknown = numberOrZero(service?.unknown);
  const total = ok + warn + error + unknown;
  const okEnd = total ? (ok / total) * 100 : 0;
  const warnEnd = total ? okEnd + (warn / total) * 100 : okEnd;
  const errorEnd = total ? warnEnd + (error / total) * 100 : warnEnd;

  return {
    eyebrow: "Service",
    title: "서비스 상태 분포",
    chartClass: "pie-chart--service",
    chartStyle: `background: conic-gradient(var(--green) 0 ${okEnd}%, var(--yellow) ${okEnd}% ${warnEnd}%, var(--red) ${warnEnd}% ${errorEnd}%, var(--blue) ${errorEnd}% 100%)`,
    chartLabel: `서비스 ${total}개 중 정상 ${ok}개, 주의 ${warn}개, 에러 ${error}개, 미확인 ${unknown}개`,
    chartValue: `${ok}/${total || DASH_PLACEHOLDER}`,
    chartCaption: "정상",
    rows: [
      { label: "정상", value: summaryValue(service, "ok") },
      { label: "주의", value: summaryValue(service, "warn") },
      { label: "에러", value: summaryValue(service, "error") },
      { label: "미확인", value: summaryValue(service, "unknown") },
      { label: "최근 갱신", value: "30초 전" },
    ],
  };
}

function buildAutomationChart(snapshot) {
  const automation = snapshot?.automation;
  const successRate = parsePercent(automation?.successRate);

  return {
    eyebrow: "Automation",
    title: "자동화 실행 분포",
    chartClass: "pie-chart--automation",
    chartStyle: `background: conic-gradient(var(--green) 0 ${successRate}%, var(--yellow) ${successRate}% 100%)`,
    chartLabel: `최근 24시간 자동화 성공률 ${valueOrDash(automation?.successRate)}, 재시도 ${numberOrZero(automation?.retryCount)}건, 실패 ${numberOrZero(automation?.failureCount)}건`,
    chartValue: valueOrDash(automation?.successRate),
    chartCaption: "성공률",
    rows: [
      { label: "성공", value: summaryValue(automation, "successCount", toRunCount) },
      { label: "재시도", value: summaryValue(automation, "retryCount", toCaseCount) },
      { label: "실패", value: summaryValue(automation, "failureCount", toCaseCount) },
      { label: "스케줄 정상률", value: "91%" },
    ],
  };
}

function buildLogChart(snapshot) {
  const log = snapshot?.logSummary;
  const ok = numberOrZero(log?.ok);
  const warn = numberOrZero(log?.warn);
  const error = numberOrZero(log?.error);
  const total = ok + warn + error;
  const okEnd = total ? (ok / total) * 100 : 0;
  const warnEnd = total ? okEnd + (warn / total) * 100 : okEnd;

  return {
    eyebrow: "Logs",
    title: "로그 상태 분포",
    chartClass: "pie-chart--logs",
    chartStyle: `background: conic-gradient(var(--green) 0 ${okEnd}%, var(--yellow) ${okEnd}% ${warnEnd}%, var(--red) ${warnEnd}% 100%)`,
    chartLabel: `최근 24시간 로그 ${total}건 중 정상 ${ok}건, 주의 ${warn}건, 오류 ${error}건`,
    chartValue: `${error}건`,
    chartCaption: "오류",
    rows: [
      { label: "정상", value: `${ok}건` },
      { label: "주의", value: `${warn}건` },
      { label: "오류", value: `${error}건` },
      { label: "확인 필요", value: valueOrDash(log?.actionRequired) },
    ],
  };
}

function buildChartPanels(snapshot) {
  return [buildServiceChart(snapshot), buildAutomationChart(snapshot), buildLogChart(snapshot)];
}

function renderDashboardBody(snapshot) {
  const resources = getArray(snapshot?.resources);
  const chartPanels = buildChartPanels(snapshot);

  return `
    <section class="operations-board operations-board--dashboard" aria-label="Dashboard 상세">
      <article class="board-cell board-cell--wide">
        <header>
          <div>
            <p class="eyebrow">Server Resources</p>
            <h2>13번 서버 자원 사용률</h2>
          </div>
        </header>
        <div class="resource-readout-grid">${renderResourceTiles(resources)}</div>
      </article>
    </section>

    <section class="status-chart-grid" aria-label="서비스, 자동화, 로그 상태 분포">
      ${chartPanels.map(renderPiePanel).join("")}
    </section>
  `;
}

/**
 * Renders the dashboard body into a caller-owned root.
 *
 * @param {{ snapshot?: object, root: Element | string | { innerHTML: string } }} params
 * @returns {{ ok: boolean, resourceCount: number, hasSnapshot: boolean }}
 */
export function renderDashboard({ snapshot, root } = {}) {
  const target = resolveRoot(root);

  if (!target) {
    return { ok: false, resourceCount: 0, hasSnapshot: Boolean(snapshot) };
  }

  target.innerHTML = renderDashboardBody(snapshot);

  return {
    ok: true,
    resourceCount: getArray(snapshot?.resources).length,
    hasSnapshot: Boolean(snapshot),
  };
}

export const dashboardApi = {
  renderDashboard,
};
