import { readFile } from "node:fs/promises";
import path from "node:path";
import { getKnowledgeSnapshot } from "./knowledge-api.js";
import { getLiveOpsSnapshot } from "./live-snapshot.js";

const overviewLabels = {
  ok: "정상",
  warn: "주의",
  error: "심각",
  unknown: "미확인",
};

function numberOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function statusFromResourcePercent(percent) {
  const numeric = numberOrNull(percent);
  if (numeric === null) return "unknown";
  if (numeric >= 90) return "error";
  if (numeric >= 75) return "warn";
  return "ok";
}

function statusValue(status) {
  if (status === "ok" || status === "warn" || status === "error" || status === "unknown") {
    return status;
  }
  return "unknown";
}

function overviewStatus(status) {
  const normalized = statusValue(status);
  return {
    label: overviewLabels[normalized],
    status: normalized,
  };
}

function worstStatus(statuses, { unknownAsWarn = false } = {}) {
  const normalized = statuses.map(statusValue);
  if (normalized.includes("error")) return "error";
  if (normalized.includes("warn")) return "warn";
  if (unknownAsWarn && normalized.includes("unknown")) return "warn";
  if (normalized.includes("ok")) return "ok";
  return "unknown";
}

function normalizeResources(resources) {
  if (!Array.isArray(resources)) return [];
  return resources.map((resource) => ({
    ...resource,
    status: statusFromResourcePercent(resource.percent),
  }));
}

function summarizeServices(services, fallback) {
  const counts = { ok: 0, warn: 0, error: 0, unknown: 0 };
  if (!Array.isArray(services) || services.length === 0) {
    return {
      ok: Number(fallback?.ok) || 0,
      warn: Number(fallback?.warn) || 0,
      error: Number(fallback?.error) || 0,
      unknown: Number(fallback?.unknown) || 0,
    };
  }

  for (const service of services) {
    counts[statusValue(service.status)] += 1;
  }
  return counts;
}

function automationStatus(automation) {
  if (automation?.status) return statusValue(automation.status);
  const successRate = numberOrNull(String(automation?.successRate ?? "").replace("%", ""));
  const retries = Number(automation?.retryCount) || 0;
  const failures = Number(automation?.failureCount) || 0;

  if (failures > 0 || (successRate !== null && successRate < 90)) return "error";
  if (retries > 5 || (successRate !== null && successRate < 95)) return "warn";
  if (successRate === null) return "unknown";
  return "ok";
}

function logStatus(logSummary) {
  if (logSummary?.status) return statusValue(logSummary.status);
  if ((Number(logSummary?.error) || 0) > 0) return "error";
  if ((Number(logSummary?.warn) || 0) > 0) return "warn";
  if ((Number(logSummary?.ok) || 0) > 0) return "ok";
  return "unknown";
}

export function normalizeOpsSnapshot(snapshot) {
  const resources = normalizeResources(snapshot.resources);
  const serviceSummary = summarizeServices(snapshot.services, snapshot.serviceSummary);
  const serviceStatuses = Object.entries(serviceSummary).flatMap(([status, value]) => Array(Number(value) || 0).fill(status));

  return {
    ...snapshot,
    resources,
    serviceSummary,
    overview: {
      resourceStatus: overviewStatus(worstStatus(resources.map((resource) => resource.status))),
      serviceStatus: overviewStatus(worstStatus(serviceStatuses, { unknownAsWarn: true })),
      automationStatus: overviewStatus(automationStatus(snapshot.automation)),
      logStatus: overviewStatus(logStatus(snapshot.logSummary)),
    },
  };
}

export async function getOpsSnapshot() {
  const snapshotPath = path.join(process.cwd(), "public/data/ops-snapshot.json");
  const raw = await readFile(snapshotPath, "utf8");
  const seed = JSON.parse(raw);
  let snapshot;

  try {
    snapshot = await getLiveOpsSnapshot(seed);
  } catch (error) {
    console.warn("LIVE_SNAPSHOT_FALLBACK", error);
    snapshot = {
      ...normalizeOpsSnapshot(seed),
      dataSource: "fallback",
    };
  }

  try {
    return normalizeOpsSnapshot({
      ...snapshot,
      ...(await getKnowledgeSnapshot(seed)),
    });
  } catch (error) {
    console.warn("KNOWLEDGE_API_FALLBACK", error);
    return normalizeOpsSnapshot(snapshot);
  }
}
