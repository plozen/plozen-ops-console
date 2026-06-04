import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const commandTimeout = 3500;

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatBytes(bytes) {
  const numeric = Number(bytes);
  if (!Number.isFinite(numeric) || numeric < 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = numeric;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${round(value, value >= 100 ? 0 : 1)}${units[index]}`;
}

function parseNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function resourceStatus(percent) {
  const numeric = parseNumber(percent);
  if (numeric === null) return "unknown";
  if (numeric >= 90) return "error";
  if (numeric >= 75) return "warn";
  return "ok";
}

function statusFromCounts({ ok = 0, warn = 0, error = 0, unknown = 0 }) {
  if (error > 0) return "error";
  if (warn > 0 || unknown > 0) return "warn";
  if (ok > 0) return "ok";
  return "unknown";
}

function splitLines(output) {
  return String(output ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function runLocal(command) {
  try {
    const { stdout, stderr } = await execFileAsync("sh", ["-lc", command], {
      timeout: commandTimeout,
      maxBuffer: 1024 * 1024,
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim(), code: 0 };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout ?? "").trim(),
      stderr: String(error.stderr ?? error.message ?? "").trim(),
      code: error.code ?? 1,
    };
  }
}

async function runSsh(host, command) {
  try {
    const { stdout, stderr } = await execFileAsync(
      "ssh",
      ["-o", "BatchMode=yes", "-o", "ConnectTimeout=3", "-o", "StrictHostKeyChecking=accept-new", host, command],
      {
        timeout: commandTimeout + 1500,
        maxBuffer: 1024 * 1024,
      },
    );
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim(), code: 0 };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout ?? "").trim(),
      stderr: String(error.stderr ?? error.message ?? "").trim(),
      code: error.code ?? 1,
    };
  }
}

function createRunner() {
  const mode = process.env.OPS_CONSOLE_COLLECTOR === "ssh" && process.env.OPS_CONSOLE_SSH_HOST ? "ssh" : "local";
  const host = process.env.OPS_CONSOLE_SSH_HOST;

  return {
    mode,
    host,
    async run(command) {
      return mode === "ssh" ? runSsh(host, command) : runLocal(command);
    },
  };
}

function formatSnapshotDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return parts.replace(" ", " ");
}

async function collectCpu(runner) {
  const [loadResult, coresResult] = await Promise.all([runner.run("awk '{print $1}' /proc/loadavg"), runner.run("nproc 2>/dev/null || getconf _NPROCESSORS_ONLN")]);
  const load = parseNumber(loadResult.stdout);
  const cores = parseNumber(coresResult.stdout) ?? os.cpus().length;
  const percent = load === null || !cores ? 0 : Math.min(100, Math.max(0, (load / cores) * 100));

  return {
    label: "CPU Load",
    value: load === null ? "-" : `Load ${round(load, 2)}`,
    note: cores ? `코어 ${cores} 기준 ${round(percent)}%` : "CPU 기준 확인 전",
    percent: round(percent),
    status: resourceStatus(percent),
  };
}

async function collectMemory(runner) {
  const result = await runner.run("awk '/MemTotal:/ {total=$2} /MemAvailable:/ {available=$2} END {print total, available}' /proc/meminfo");
  const [totalKb, availableKb] = result.stdout.split(/\s+/).map(parseNumber);
  if (!result.ok || totalKb === null || availableKb === null || totalKb <= 0) {
    return { label: "Memory", value: "-", note: "메모리 확인 전", percent: 0, status: "unknown" };
  }

  const usedKb = totalKb - availableKb;
  const percent = (usedKb / totalKb) * 100;
  return {
    label: "Memory",
    value: `${formatBytes(usedKb * 1024)} / ${formatBytes(totalKb * 1024)}`,
    note: `전체 메모리의 ${round(percent)}%`,
    percent: round(percent),
    status: resourceStatus(percent),
  };
}

function parseDfLine(line) {
  const columns = String(line ?? "").trim().split(/\s+/);
  if (columns.length < 6) return null;
  const capacity = parseNumber(columns[4]?.replace("%", ""));
  const used = parseNumber(columns[2]);
  const total = parseNumber(columns[1]);
  const mountedOn = columns.slice(5).join(" ");
  if (capacity === null || used === null || total === null) return null;
  return { capacity, used, total, mountedOn };
}

async function collectDisk(runner, label, paths, fallbackNote) {
  const quotedPaths = paths.map(shellQuote).join(" ");
  const result = await runner.run(`for p in ${quotedPaths}; do if [ -e "$p" ]; then df -kP "$p" | tail -1; exit 0; fi; done; exit 1`);
  const parsed = parseDfLine(result.stdout);
  if (!result.ok || !parsed) {
    return { label, value: "-", note: fallbackNote, percent: 0, status: "unknown" };
  }

  return {
    label,
    value: `${formatBytes(parsed.used * 1024)} / ${formatBytes(parsed.total * 1024)}`,
    note: `${parsed.mountedOn} ${round(parsed.capacity)}%`,
    percent: parsed.capacity,
    status: resourceStatus(parsed.capacity),
  };
}

function configuredDataPaths() {
  return String(process.env.OPS_CONSOLE_DATA_PATHS || process.env.OPS_CONSOLE_DATA_PATH || "/mnt/data,/data,/srv,/home")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);
}

async function collectResources(runner) {
  const [cpu, memory, rootDisk, dataDisk] = await Promise.all([
    collectCpu(runner),
    collectMemory(runner),
    collectDisk(runner, "SSD Root", ["/"], "루트 디스크 확인 전"),
    collectDisk(runner, "HDD Data", configuredDataPaths(), "데이터 볼륨 경로 확인 전"),
  ]);
  return [cpu, memory, rootDisk, dataDisk];
}

async function collectDockerNames(runner) {
  const result = await runner.run("docker ps --format '{{.Names}}'");
  return {
    available: result.ok,
    names: splitLines(result.stdout),
  };
}

function normalizePort(port) {
  const value = String(port ?? "").trim();
  if (!/^\d+$/.test(value)) return null;
  return value;
}

async function collectListeningPorts(runner) {
  const result = await runner.run("ss -ltnH 2>/dev/null | awk '{print $4}' | sed -E 's/.*:([0-9]+)$/\\1/' | sort -u");
  if (!result.ok) return { available: false, ports: new Set() };
  return { available: true, ports: new Set(splitLines(result.stdout).filter((line) => /^\d+$/.test(line))) };
}

function dockerNameMatches(service, names) {
  const candidates = [service.process, service.name].map((value) => String(value ?? "").toLowerCase()).filter(Boolean);
  return names.some((name) => {
    const normalized = name.toLowerCase();
    return candidates.some((candidate) => normalized.includes(candidate) || candidate.includes(normalized));
  });
}

async function checkSystemd(runner, unit) {
  if (!String(unit ?? "").endsWith(".service")) return "unknown";
  const systemResult = await runner.run(`systemctl is-active ${shellQuote(unit)} 2>/dev/null`);
  if (systemResult.ok && systemResult.stdout === "active") return "ok";

  const userResult = await runner.run(`systemctl --user is-active ${shellQuote(unit)} 2>/dev/null`);
  if (userResult.ok && userResult.stdout === "active") return "ok";

  const state = userResult.stdout || systemResult.stdout;
  if (state === "inactive" || state === "failed") return "error";
  return "unknown";
}

async function checkProcess(runner, pattern) {
  const value = String(pattern ?? "").trim();
  if (!value || value === "-" || value.endsWith(".service")) return "unknown";
  const result = await runner.run(`pgrep -af ${shellQuote(value)} >/dev/null 2>&1`);
  if (result.ok) return "ok";
  return "unknown";
}

function statusFromChecks(checks) {
  if (checks.includes("error")) return checks.includes("ok") ? "warn" : "error";
  if (checks.includes("warn")) return "warn";
  if (checks.includes("ok")) return "ok";
  return "unknown";
}

async function collectServiceStatus(service, context) {
  const port = normalizePort(service.port);
  const portStatus = port && context.listeningPorts.available ? (context.listeningPorts.ports.has(port) ? "ok" : "error") : "unknown";

  if (service.runtime === "Docker") {
    const dockerStatus = context.docker.available ? (dockerNameMatches(service, context.docker.names) ? "ok" : "error") : "unknown";
    return dockerStatus === "unknown" ? portStatus : dockerStatus;
  }

  const [systemdStatus, processStatus] = await Promise.all([checkSystemd(context.runner, service.process), checkProcess(context.runner, service.process)]);
  if (String(service.process ?? "").endsWith(".service")) {
    return statusFromChecks([systemdStatus, portStatus]);
  }
  return statusFromChecks([processStatus, portStatus]);
}

async function collectServices(seedServices, runner) {
  const [docker, listeningPorts] = await Promise.all([collectDockerNames(runner), collectListeningPorts(runner)]);
  const context = { docker, listeningPorts, runner };
  const services = Array.isArray(seedServices) ? seedServices : [];

  return Promise.all(
    services.map(async (service) => ({
      ...service,
      status: await collectServiceStatus(service, context),
    })),
  );
}

function summarizeByStatus(items) {
  return items.reduce(
    (summary, item) => {
      const status = item.status === "ok" || item.status === "warn" || item.status === "error" ? item.status : "unknown";
      summary[status] += 1;
      return summary;
    },
    { ok: 0, warn: 0, error: 0, unknown: 0 },
  );
}

function automationFromServices(services) {
  const automationServices = services.filter((service) => service.category === "자동화");
  const summary = summarizeByStatus(automationServices);
  const total = automationServices.length;
  const ok = summary.ok;
  const warn = summary.warn + summary.unknown;
  const error = summary.error;
  const successRate = total ? `${round((ok / total) * 100)}%` : "-";

  return {
    successRate,
    successCount: ok,
    retryCount: warn,
    failureCount: error,
    status: statusFromCounts({ ok, warn, error }),
  };
}

async function collectLogs(runner) {
  const errorResult = await runner.run("journalctl --since '24 hours ago' -p err..alert --no-pager -q 2>/dev/null | wc -l");
  const warnResult = await runner.run("journalctl --since '24 hours ago' -p warning --no-pager -q 2>/dev/null | wc -l");
  const error = errorResult.ok ? (parseNumber(errorResult.stdout) ?? 0) : 0;
  const warn = warnResult.ok ? Math.max(0, (parseNumber(warnResult.stdout) ?? 0) - error) : 0;
  const status = errorResult.ok || warnResult.ok ? statusFromCounts({ ok: 1, warn, error }) : "unknown";

  return {
    ok: status === "ok" ? 1 : 0,
    warn,
    error,
    status,
    actionRequired: status === "unknown" ? "journal 확인 불가" : `오류 ${error} · 주의 ${warn}`,
  };
}

async function collectHostName(runner) {
  const result = await runner.run("hostname");
  return result.ok ? result.stdout : os.hostname();
}

export async function getLiveOpsSnapshot(seed) {
  const runner = createRunner();
  const [hostName, resources, services, logSummary] = await Promise.all([
    collectHostName(runner),
    collectResources(runner),
    collectServices(seed.services, runner),
    collectLogs(runner),
  ]);

  return {
    ...seed,
    snapshotDate: formatSnapshotDate(),
    dataSource: runner.mode,
    serverLabel: process.env.OPS_CONSOLE_SERVER_LABEL || hostName || "현재 서버",
    resources,
    services,
    serviceSummary: summarizeByStatus(services),
    automation: automationFromServices(services),
    logSummary,
  };
}
