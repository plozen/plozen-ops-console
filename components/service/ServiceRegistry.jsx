"use client";

import { useMemo, useState } from "react";
import { statusClass } from "../../lib/status";

const serviceStatusLabels = {
  ok: "정상",
  warn: "주의",
  error: "에러",
  unknown: "미확인",
};

const defaultFilters = {
  query: "",
  status: "all",
  runtime: "all",
  category: "all",
};

const runtimeOrder = ["Docker", "Host/systemd"];
const categoryOrder = ["웹 UI", "API", "자동화", "Agent", "DB", "원격 접속"];

function normalize(value) {
  return String(value ?? "").trim();
}

function uniqueOptions(services, key, preferredOrder) {
  const values = new Set(services.map((service) => normalize(service[key])).filter(Boolean));
  const ordered = preferredOrder.filter((value) => values.has(value));
  const rest = [...values].filter((value) => !preferredOrder.includes(value)).sort((a, b) => a.localeCompare(b, "ko"));
  return [...ordered, ...rest];
}

function serviceSearchText(service) {
  return [service.name, service.description, service.status, service.runtime, service.category, service.port, service.process]
    .map((value) => normalize(value).toLowerCase())
    .join(" ");
}

function filterServices(services, filters) {
  const query = normalize(filters.query).toLowerCase();

  return services.filter((service) => {
    const matchesQuery = !query || serviceSearchText(service).includes(query);
    const matchesStatus = filters.status === "all" || service.status === filters.status;
    const matchesRuntime = filters.runtime === "all" || service.runtime === filters.runtime;
    const matchesCategory = filters.category === "all" || service.category === filters.category;
    return matchesQuery && matchesStatus && matchesRuntime && matchesCategory;
  });
}

function StatusPill({ status }) {
  const normalized = serviceStatusLabels[status] ? status : "unknown";

  return (
    <span
      className={`state-pill service-status service-status--${normalized} service-status-pill service-status-pill--${normalized} ${statusClass(normalized)}`}
      data-service-status={normalized}
    >
      <i className="service-status-dot" aria-hidden="true" />
      <span className="service-status-label">{serviceStatusLabels[normalized]}</span>
    </span>
  );
}

function updateFilter(setFilters, key, value) {
  setFilters((current) => ({ ...current, [key]: value }));
}

export default function ServiceRegistry({ services }) {
  const [filters, setFilters] = useState(defaultFilters);
  const safeServices = useMemo(() => (Array.isArray(services) ? services : []), [services]);
  const runtimeOptions = useMemo(() => uniqueOptions(safeServices, "runtime", runtimeOrder), [safeServices]);
  const categoryOptions = useMemo(() => uniqueOptions(safeServices, "category", categoryOrder), [safeServices]);
  const rows = useMemo(() => filterServices(safeServices, filters), [safeServices, filters]);

  return (
    <section className="data-section service-section" aria-label="Service 상세 목록">
      <header>
        <div>
          <p className="eyebrow">Service List</p>
          <h2>Service 레지스트리</h2>
        </div>
        <strong className="board-label">Docker + Host</strong>
      </header>
      <div className="filter-bar filter-bar--service service-filter-bar" aria-label="서비스 조회 조건">
        <label className="filter-field filter-field--search">
          <span>검색어</span>
          <input
            id="service-query"
            type="search"
            placeholder="서비스명 또는 프로세스"
            value={filters.query}
            onChange={(event) => updateFilter(setFilters, "query", event.target.value)}
          />
        </label>
        <label className="filter-field">
          <span>상태</span>
          <select id="service-status-filter" value={filters.status} onChange={(event) => updateFilter(setFilters, "status", event.target.value)}>
            <option value="all">전체</option>
            <option value="ok">정상</option>
            <option value="warn">주의</option>
            <option value="error">에러</option>
            <option value="unknown">미확인</option>
          </select>
        </label>
        <label className="filter-field">
          <span>실행 방식</span>
          <select id="service-runtime-filter" value={filters.runtime} onChange={(event) => updateFilter(setFilters, "runtime", event.target.value)}>
            <option value="all">전체</option>
            {runtimeOptions.map((runtime) => (
              <option key={runtime} value={runtime}>
                {runtime}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>분류</span>
          <select id="service-category-filter" value={filters.category} onChange={(event) => updateFilter(setFilters, "category", event.target.value)}>
            <option value="all">전체</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <button className="filter-submit" type="button" id="service-search-button">
          검색
        </button>
      </div>
      <div className="table-wrap service-table-wrap">
        <table className="service-table">
          <thead>
            <tr>
              <th>서비스</th>
              <th>상태</th>
              <th>실행 방식</th>
              <th>분류</th>
              <th>포트</th>
              <th>프로세스</th>
            </tr>
          </thead>
          <tbody id="service-rows">
            {rows.length ? (
              rows.map((service) => (
                <tr className="service-row" key={`${service.name}-${service.process}`} data-service-status={service.status} data-service-runtime={service.runtime}>
                  <td data-label="서비스">
                    <span className="name-cell service-name service-name-cell">
                      <strong>{service.name || "-"}</strong>
                      <em>{service.description || "-"}</em>
                    </span>
                  </td>
                  <td data-label="상태">
                    <StatusPill status={service.status} />
                  </td>
                  <td data-label="실행 방식">{service.runtime || "-"}</td>
                  <td data-label="분류">{service.category || "-"}</td>
                  <td data-label="포트">{service.port || "-"}</td>
                  <td data-label="프로세스">{service.process || "-"}</td>
                </tr>
              ))
            ) : (
              <tr className="service-row service-row--empty">
                <td className="empty-row service-empty-row" colSpan={6}>
                  조건에 맞는 서비스가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
