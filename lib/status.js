export const statusLabels = {
  ok: "정상",
  warn: "주의",
  error: "에러",
  unknown: "미확인",
  loaded: "적재",
  vector: "벡터",
  failed: "실패",
  info: "정보",
};

export function metricClass(status) {
  if (status === "ok" || status === "vector") return "metric-card--ok";
  if (status === "warn" || status === "loaded") return "metric-card--warn";
  if (status === "error" || status === "failed") return "metric-card--critical";
  if (status === "unknown") return "metric-card--unknown";
  return "metric-card--info";
}

export function statusClass(status) {
  if (status === "ok" || status === "vector") return "status-ok";
  if (status === "warn" || status === "loaded") return "status-warn";
  if (status === "error" || status === "failed") return "status-error";
  return "status-unknown";
}

export function count(value, suffix = "개") {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric}${suffix}` : "-";
}

export function text(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}
