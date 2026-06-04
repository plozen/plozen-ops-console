export function filterKnowledgeDocuments(documents = [], filters = {}) {
  const query = (filters.query || "").trim().toLowerCase();
  const status = filters.status || "all";
  const source = filters.source || "all";
  const type = filters.type || "all";
  const sourceDocuments = Array.isArray(documents) ? documents : [];

  return sourceDocuments.filter((document) => {
    const searchable = `${document.name} ${document.type} ${document.source}`.toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (status === "all" || document.status === status) &&
      (type === "all" || document.type === type) &&
      (source === "all" || document.source === source)
    );
  });
}

export function populateKnowledgeSources({ documents, select }) {
  if (!select) return;

  const previousValue = select.value || "all";
  const sources = [...new Set((documents || []).map((document) => document.source).filter(Boolean))];
  select.innerHTML = `<option value="all">전체</option>${sources
    .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
    .join("")}`;

  if ([...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  }
}

export function renderKnowledge({
  documents,
  tbody,
  pagination,
  filters,
  stateLabels,
  getStatusClass,
}) {
  if (!tbody) return;

  const rows = filterKnowledgeDocuments(documents || [], filters);
  if (pagination) {
    pagination.textContent = rows.length ? `1~${rows.length} / ${rows.length}` : "0 / 0";
  }

  if (!rows.length) {
    tbody.innerHTML = `<tr><td class="empty-row" colspan="9">조건에 맞는 문서가 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((document) => renderKnowledgeRow({
    document,
    stateLabels,
    getStatusClass,
  })).join("");
}

function renderKnowledgeRow({ document, stateLabels, getStatusClass }) {
  const statusLabel = stateLabels?.[document.status] || document.status;
  const statusClass = getStatusClass ? getStatusClass(document.status) : "";
  const canVectorize = document.status === "loaded" || document.status === "failed";
  return `
    <tr>
      <td data-label="선택">
        <label class="checkbox-hitbox">
          <input type="checkbox" aria-label="${escapeHtml(document.name)} 선택" ${canVectorize ? "" : "disabled"} />
        </label>
      </td>
      <td data-label="문서명">${escapeHtml(document.name)}</td>
      <td data-label="파일 형식">${escapeHtml(document.type)}</td>
      <td data-label="저장 위치">${escapeHtml(document.source)}</td>
      <td data-label="조각 수">${escapeHtml(document.chunks)}</td>
      <td data-label="글자량">${escapeHtml(document.characters)}</td>
      <td data-label="상태">
        <span class="state-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
      </td>
      <td data-label="최근 처리">${escapeHtml(document.processedAt)}</td>
      <td data-label="작업">
        <button class="table-action" type="button" ${canVectorize ? "" : "disabled"}>벡터 생성</button>
      </td>
    </tr>
  `;
}

export function renderUploadFiles({ files, root }) {
  if (!root) return;

  const uploadFiles = Array.isArray(files) ? files : [];
  if (!uploadFiles.length) {
    root.innerHTML = `
      <div class="upload-file-row upload-file-row--empty">
        <strong>선택한 파일이 없습니다.</strong>
        <span>파일 추가로 문서를 선택하세요.</span>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="upload-file-row upload-file-row--head">
      <span>파일명</span>
      <span>파일 형식</span>
      <span>크기</span>
      <span>작업</span>
    </div>
    ${uploadFiles
      .map(
        (file) => `
          <div class="upload-file-row">
            <strong>${escapeHtml(file.name)}</strong>
            <span>${escapeHtml(file.type)}</span>
            <span>${escapeHtml(file.size)}</span>
            <button type="button">제외</button>
          </div>
        `,
      )
      .join("")}
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
