import { count, statusClass, statusLabels, text } from "../../lib/status";

function numberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parsePercent(value) {
  const numeric = Number(String(value ?? "").replace("%", ""));
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0;
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
}

function ResourceTile({ item }) {
  const status = item?.status ?? "unknown";
  const percent = clampPercent(item?.percent);

  return (
    <div className={`resource-readout resource-readout--${status} ${statusClass(status)}`}>
      <span>{text(item?.label)}</span>
      <strong title={text(item?.value)}>{text(item?.value)}</strong>
      <em>{text(item?.note)}</em>
      <i aria-label={`${statusLabels[status] ?? statusLabels.unknown} ${percent}%`} style={{ "--value": `${percent}%` }} />
    </div>
  );
}

const fallbackResources = [
  { label: "CPU Load", value: "-", note: "현재 사용률 확인 전", percent: 0, status: "unknown" },
  { label: "Memory", value: "-", note: "전체 메모리 확인 전", percent: 0, status: "unknown" },
  { label: "SSD Root", value: "-", note: "루트 디스크 확인 전", percent: 0, status: "unknown" },
  { label: "HDD Data", value: "-", note: "데이터 볼륨 확인 전", percent: 0, status: "unknown" },
];

function dashboardResources(resources) {
  const items = Array.isArray(resources) ? resources.filter(Boolean).slice(0, 4) : [];
  return [...items, ...fallbackResources.slice(items.length)].slice(0, 4);
}

function LegendRows({ rows }) {
  return rows.map((row) => (
    <div key={row.label}>
      <dt>{row.label}</dt>
      <dd>{row.value}</dd>
    </div>
  ));
}

function PiePanel({ panel }) {
  return (
    <article className="chart-panel">
      <header>
        <div>
          <p className="eyebrow">{panel.eyebrow}</p>
          <h2>{panel.title}</h2>
        </div>
      </header>
      <div className="pie-summary">
        <div className={`pie-chart ${panel.chartClass}`} role="img" aria-label={panel.chartLabel} style={panel.chartStyle}>
          <strong>{panel.chartValue}</strong>
          <span>{panel.chartCaption}</span>
        </div>
        <dl className="chart-legend">
          <LegendRows rows={panel.rows} />
        </dl>
      </div>
    </article>
  );
}

function buildServicePanel(snapshot) {
  const service = snapshot.serviceSummary ?? {};
  const ok = numberOrZero(service.ok);
  const warn = numberOrZero(service.warn);
  const error = numberOrZero(service.error);
  const unknown = numberOrZero(service.unknown);
  const total = ok + warn + error + unknown;
  const okEnd = total ? (ok / total) * 100 : 0;
  const warnEnd = total ? okEnd + (warn / total) * 100 : okEnd;
  const errorEnd = total ? warnEnd + (error / total) * 100 : warnEnd;

  return {
    eyebrow: "Service",
    title: "서비스 상태 분포",
    chartClass: "pie-chart--service",
    chartStyle: {
      background: `conic-gradient(var(--green) 0 ${okEnd}%, var(--yellow) ${okEnd}% ${warnEnd}%, var(--red) ${warnEnd}% ${errorEnd}%, var(--blue) ${errorEnd}% 100%)`,
    },
    chartLabel: `서비스 ${total}개 중 정상 ${ok}개, 주의 ${warn}개, 에러 ${error}개, 미확인 ${unknown}개`,
    chartValue: `${ok}/${total || "-"}`,
    chartCaption: "정상",
    rows: [
      { label: "정상", value: count(service.ok) },
      { label: "주의", value: count(service.warn) },
      { label: "에러", value: count(service.error) },
      { label: "미확인", value: count(service.unknown) },
      { label: "기준일", value: text(snapshot.snapshotDate) },
    ],
  };
}

function buildAutomationPanel(snapshot) {
  const automation = snapshot.automation ?? {};
  const successRate = parsePercent(automation.successRate);

  return {
    eyebrow: "Automation",
    title: "자동화 실행 분포",
    chartClass: "pie-chart--automation",
    chartStyle: {
      background: `conic-gradient(var(--green) 0 ${successRate}%, var(--yellow) ${successRate}% 100%)`,
    },
    chartLabel: `자동화 서비스 정상률 ${text(automation.successRate)}, 주의 ${numberOrZero(automation.retryCount)}건, 에러 ${numberOrZero(automation.failureCount)}건`,
    chartValue: text(automation.successRate),
    chartCaption: "성공률",
    rows: [
      { label: "정상", value: count(automation.successCount) },
      { label: "주의/미확인", value: count(automation.retryCount) },
      { label: "에러", value: count(automation.failureCount) },
      { label: "기준일", value: text(snapshot.snapshotDate) },
    ],
  };
}

function buildLogPanel(snapshot) {
  const log = snapshot.logSummary ?? {};
  const ok = numberOrZero(log.ok);
  const warn = numberOrZero(log.warn);
  const error = numberOrZero(log.error);
  const total = ok + warn + error;
  const okEnd = total ? (ok / total) * 100 : 0;
  const warnEnd = total ? okEnd + (warn / total) * 100 : okEnd;

  return {
    eyebrow: "Logs",
    title: "로그 상태 분포",
    chartClass: "pie-chart--logs",
    chartStyle: {
      background: `conic-gradient(var(--green) 0 ${okEnd}%, var(--yellow) ${okEnd}% ${warnEnd}%, var(--red) ${warnEnd}% 100%)`,
    },
    chartLabel: `최근 24시간 로그 ${total}건 중 정상 ${ok}건, 주의 ${warn}건, 오류 ${error}건`,
    chartValue: `${error}건`,
    chartCaption: "오류",
    rows: [
      { label: "정상", value: `${ok}건` },
      { label: "주의", value: `${warn}건` },
      { label: "오류", value: `${error}건` },
      { label: "확인 필요", value: text(log.actionRequired) },
    ],
  };
}

export default function DashboardView({ snapshot }) {
  const resources = dashboardResources(snapshot.resources);
  const panels = [buildServicePanel(snapshot), buildAutomationPanel(snapshot), buildLogPanel(snapshot)];

  return (
    <>
      <section className="operations-board operations-board--dashboard" aria-label="Dashboard 상세">
        <article className="board-cell board-cell--wide">
          <header>
            <div>
              <p className="eyebrow">Server Resources</p>
              <h2>{snapshot.serverLabel ?? "현재 서버"} 자원 사용률</h2>
            </div>
          </header>
          <div className="resource-readout-grid">
            {resources.map((item) => (
              <ResourceTile key={item.label} item={item} />
            ))}
          </div>
        </article>
      </section>

      <section className="status-chart-grid" aria-label="서비스, 자동화, 로그 상태 분포">
        {panels.map((panel) => (
          <PiePanel key={panel.eyebrow} panel={panel} />
        ))}
      </section>
    </>
  );
}
