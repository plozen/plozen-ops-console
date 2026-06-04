"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const documentPageSize = 10;

const statusLabels = {
  loaded: "적재",
  vector: "벡터",
  failed: "실패",
};

const statusStateClass = {
  loaded: "state--wait",
  vector: "state--done",
  failed: "state--error",
};

const defaultFilters = {
  query: "",
  status: "all",
  type: "all",
  source: "all",
};

function normalize(value) {
  return String(value ?? "").trim();
}

function uniqueOptions(items, key) {
  return [...new Set(items.map((item) => normalize(item?.[key])).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko"));
}

function documentSearchText(document) {
  return [document.name, document.type, document.source, document.status, document.sourceType, document.sourceUri]
    .map((value) => normalize(value).toLowerCase())
    .join(" ");
}

function filterDocuments(documents, filters) {
  const query = normalize(filters.query).toLowerCase();

  return documents.filter((document) => {
    const matchesQuery = !query || documentSearchText(document).includes(query);
    const matchesStatus = filters.status === "all" || document.status === filters.status;
    const matchesType = filters.type === "all" || document.type === filters.type;
    const matchesSource = filters.source === "all" || document.source === filters.source;
    return matchesQuery && matchesStatus && matchesType && matchesSource;
  });
}

function updateFilter(setFilters, key, value) {
  setFilters((current) => ({ ...current, [key]: value }));
}

function StatusState({ status }) {
  const normalized = statusLabels[status] ? status : "loaded";

  return <span className={`state ${statusStateClass[normalized]}`}>{statusLabels[normalized]}</span>;
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `요청 실패: ${response.status}`);
  }
  return payload;
}

function KnowledgeDocumentTable({ documents, selectedDocumentIds, vectorizingIds, filters, onFiltersChange, onSelectDocument, onSelectAll, onVectorizeDocuments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const typeOptions = useMemo(() => uniqueOptions(documents, "type"), [documents]);
  const sourceOptions = useMemo(() => uniqueOptions(documents, "source"), [documents]);
  const rows = useMemo(() => filterDocuments(documents, filters), [documents, filters]);
  const pageCount = Math.max(1, Math.ceil(rows.length / documentPageSize));
  const pageStartIndex = (currentPage - 1) * documentPageSize;
  const visibleRows = useMemo(() => rows.slice(pageStartIndex, pageStartIndex + documentPageSize), [pageStartIndex, rows]);
  const selectableRows = useMemo(() => visibleRows.filter((document) => document.status !== "vector"), [visibleRows]);
  const isAllSelected = selectableRows.length > 0 && selectableRows.every((document) => selectedDocumentIds.includes(document.id));
  const firstVisibleRow = rows.length ? pageStartIndex + 1 : 0;
  const lastVisibleRow = rows.length ? Math.min(pageStartIndex + visibleRows.length, rows.length) : 0;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  function changeFilter(key, value) {
    setCurrentPage(1);
    onFiltersChange(key, value);
  }

  return (
    <section id="vector-db" className="knowledge-section data-section" aria-label="Vector DB 문서 관리">
      <header>
        <div>
          <p className="eyebrow">Vector DB</p>
          <h2>문서 관리</h2>
        </div>
        <button className="section-action" type="button" disabled={!selectedDocumentIds.length} onClick={() => onVectorizeDocuments(selectedDocumentIds)}>
          선택 문서 벡터 생성
        </button>
      </header>

      <div className="filter-bar filter-bar--knowledge" aria-label="문서 조회 조건">
        <label className="filter-field filter-field--search">
          <span>검색어</span>
          <input
            aria-label="문서명 검색어"
            placeholder="문서명 또는 출처"
            type="search"
            value={filters.query}
            onChange={(event) => changeFilter("query", event.target.value)}
          />
        </label>
        <label className="filter-field">
          <span>상태</span>
          <select aria-label="상태 필터" value={filters.status} onChange={(event) => changeFilter("status", event.target.value)}>
            <option value="all">전체</option>
            <option value="loaded">적재</option>
            <option value="vector">벡터</option>
            <option value="failed">실패</option>
          </select>
        </label>
        <label className="filter-field">
          <span>파일 형식</span>
          <select aria-label="파일 형식 필터" value={filters.type} onChange={(event) => changeFilter("type", event.target.value)}>
            <option value="all">전체</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>저장 위치</span>
          <select aria-label="저장 위치 필터" value={filters.source} onChange={(event) => changeFilter("source", event.target.value)}>
            <option value="all">전체</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <button className="filter-submit" type="button">
          검색
        </button>
      </div>

      <div className="table-wrap knowledge-table-wrap">
        <table className="knowledge-table">
          <thead>
            <tr>
              <th>
                <label className="checkbox-hitbox">
                  <input
                    aria-label="문서 전체 선택"
                    checked={isAllSelected}
                    disabled={!selectableRows.length}
                    type="checkbox"
                    onChange={(event) => onSelectAll(event.target.checked, selectableRows)}
                  />
                </label>
              </th>
              <th>문서명</th>
              <th>파일 형식</th>
              <th>저장 위치</th>
              <th>조각 수</th>
              <th>글자량</th>
              <th>상태</th>
              <th>최근 처리</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              visibleRows.map((document) => (
                <tr key={document.id || `${document.name}-${document.processedAt}`}>
                  <td>
                    <label className="checkbox-hitbox">
                      <input
                        aria-label={`${document.name} 선택`}
                        checked={selectedDocumentIds.includes(document.id)}
                        disabled={document.status === "vector" || vectorizingIds.includes(document.id)}
                        type="checkbox"
                        onChange={(event) => onSelectDocument(document, event.target.checked)}
                      />
                    </label>
                  </td>
                  <td data-label="문서명">{document.name || "-"}</td>
                  <td data-label="파일 형식">{document.type || "-"}</td>
                  <td data-label="저장 위치">{document.source || "-"}</td>
                  <td data-label="조각 수">{document.chunks || "-"}</td>
                  <td data-label="글자량">{document.characters || "-"}</td>
                  <td data-label="상태">
                    <StatusState status={document.status} />
                  </td>
                  <td data-label="최근 처리">{document.processedAt || "-"}</td>
                  <td data-label="작업">
                    <button
                      className="table-action"
                      type="button"
                      disabled={document.status === "vector" || vectorizingIds.includes(document.id)}
                      onClick={() => onVectorizeDocuments([document.id])}
                    >
                      {vectorizingIds.includes(document.id) ? "생성 중" : "벡터 생성"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="empty-row" colSpan={9}>
                  조건에 맞는 문서가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination" aria-label="문서 목록 페이지">
        <span>{rows.length ? `${firstVisibleRow}~${lastVisibleRow} / ${rows.length}` : "0 / 0"}</span>
        <span>페이지당 10개</span>
        <div className="pagination-controls">
          <button disabled={currentPage <= 1} type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
            이전
          </button>
          <button disabled={currentPage >= pageCount} type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>
            다음
          </button>
        </div>
      </div>
    </section>
  );
}

function KnowledgeUploadSection({ selectedFiles, uploadStatus, isUploading, isDropActive, fileInputRef, onDragLeave, onDragOver, onFileChange, onFileDrop, onFileRequest, onRemoveFile, onUpload }) {
  const fileInputId = "knowledge-upload-native-file";

  return (
    <section id="document-upload" className="knowledge-section knowledge-upload-section data-section" aria-label="문서 업로드">
      <header>
        <div>
          <p className="eyebrow">Document Upload</p>
          <h2>문서 업로드</h2>
        </div>
      </header>
      <input id={fileInputId} ref={fileInputRef} className="sr-only" type="file" accept=".md,.txt,text/markdown,text/plain" multiple onChange={onFileChange} />
      <div
        className={isDropActive ? "upload-file-list is-drop-active" : "upload-file-list"}
        aria-label="선택한 파일 목록"
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onFileDrop}
      >
        {selectedFiles.length ? (
          <>
            <div className="upload-file-row upload-file-row--head">
              <span>파일명</span>
              <span>파일 형식</span>
              <span>크기</span>
              <span>작업</span>
            </div>
            {selectedFiles.map((file) => (
              <div className="upload-file-row" key={`${file.name}-${file.size}-${file.lastModified}`}>
                <strong>{file.name}</strong>
                <span>{file.name.endsWith(".md") ? "Markdown" : "TXT"}</span>
                <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
                <button type="button" onClick={() => onRemoveFile(file)}>
                  제외
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="upload-file-row upload-file-row--empty">
            <strong>선택한 파일이 없습니다.</strong>
            <span>파일 추가 버튼 또는 드래그로 문서를 선택하세요.</span>
          </div>
        )}
      </div>
      {uploadStatus ? <p className="knowledge-help">{uploadStatus}</p> : null}
      <div className="upload-footer">
        <div className="button-row">
          <button type="button" onClick={onFileRequest}>
            파일 추가
          </button>
          <button type="button" onClick={onUpload} disabled={isUploading || !selectedFiles.length}>
            {isUploading ? "업로드 중" : "전체 업로드"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function KnowledgeDatabaseView({ documents }) {
  const [documentRows, setDocumentRows] = useState(Array.isArray(documents) ? documents : []);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [vectorizingIds, setVectorizingIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const fileInputRef = useRef(null);

  async function refreshDocuments() {
    const payload = await readJson(await fetch("/api/knowledge/documents", { cache: "no-store" }));
    setDocumentRows(Array.isArray(payload.documents) ? payload.documents : []);
    setSelectedDocumentIds([]);
  }

  function selectDocument(document, isSelected) {
    if (!document?.id || document.status === "vector") return;
    setSelectedDocumentIds((current) => {
      if (isSelected) {
        return current.includes(document.id) ? current : [...current, document.id];
      }
      return current.filter((id) => id !== document.id);
    });
  }

  function selectAll(isSelected, rows) {
    setSelectedDocumentIds(isSelected ? rows.map((document) => document.id).filter(Boolean) : []);
  }

  function normalizeFiles(fileList) {
    return [...(fileList || [])].filter((file) => /\.(md|txt)$/i.test(file.name));
  }

  function appendSelectedFiles(fileList, inputElement) {
    const files = normalizeFiles(fileList);
    if (!files.length) {
      setUploadStatus(".md/.txt 파일만 추가할 수 있습니다.");
      if (inputElement) inputElement.value = "";
      return;
    }
    setSelectedFiles((current) => [...current, ...files]);
    setUploadStatus("");
    if (inputElement) inputElement.value = "";
  }

  function requestFiles() {
    fileInputRef.current?.click();
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDropActive(true);
  }

  function handleDragLeave() {
    setIsDropActive(false);
  }

  function handleFileChange(event) {
    appendSelectedFiles(event.currentTarget.files, event.currentTarget);
  }

  function handleFileDrop(event) {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    setIsDropActive(false);
    appendSelectedFiles(event.dataTransfer.files, fileInputRef.current);
  }

  function removeFile(file) {
    setSelectedFiles((current) => current.filter((item) => item !== file));
  }

  async function uploadFiles() {
    const files = selectedFiles.length ? selectedFiles : normalizeFiles(fileInputRef.current?.files);
    if (!files.length) {
      setUploadStatus("파일을 먼저 선택하세요.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("source_type", "uploaded_file");
        formData.append("title", file.name);
        await readJson(
          await fetch("/api/knowledge/upload", {
            method: "POST",
            body: formData,
          }),
        );
      }
      setUploadStatus(`${files.length}개 문서를 적재했습니다. 벡터 생성 버튼으로 처리하세요.`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshDocuments();
    } catch (error) {
      setUploadStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function vectorizeDocuments(ids) {
    const targetIds = [...new Set(ids.filter(Boolean))];
    if (!targetIds.length) return;

    setVectorizingIds(targetIds);
    setUploadStatus("");
    try {
      for (const id of targetIds) {
        await readJson(
          await fetch(`/api/knowledge/documents/${encodeURIComponent(id)}/vectorize`, {
            method: "POST",
          }),
        );
      }
      setUploadStatus(`${targetIds.length}개 문서의 벡터 생성을 완료했습니다.`);
      await refreshDocuments();
    } catch (error) {
      setUploadStatus(error.message);
    } finally {
      setVectorizingIds([]);
    }
  }

  return (
    <>
      <KnowledgeDocumentTable
        documents={documentRows}
        selectedDocumentIds={selectedDocumentIds}
        vectorizingIds={vectorizingIds}
        filters={filters}
        onFiltersChange={(key, value) => updateFilter(setFilters, key, value)}
        onSelectDocument={selectDocument}
        onSelectAll={selectAll}
        onVectorizeDocuments={vectorizeDocuments}
      />
      <KnowledgeUploadSection
        selectedFiles={selectedFiles}
        uploadStatus={uploadStatus}
        isUploading={isUploading}
        isDropActive={isDropActive}
        fileInputRef={fileInputRef}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onFileChange={handleFileChange}
        onFileDrop={handleFileDrop}
        onFileRequest={requestFiles}
        onRemoveFile={removeFile}
        onUpload={uploadFiles}
      />
    </>
  );
}
