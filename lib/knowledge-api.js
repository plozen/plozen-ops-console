const sourceLabels = {
  architecture_doc: "Repository",
  manual_note: "직접 입력",
  obsidian_note: "Obsidian",
  project_doc: "Obsidian",
  todo_card: "Todo",
  uploaded_file: "직접 업로드",
};

function normalizeBaseUrl(value) {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

function knowledgeApiHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (process.env.KNOWLEDGE_API_KEY) {
    headers["X-Knowledge-Api-Key"] = process.env.KNOWLEDGE_API_KEY;
  }
  return headers;
}

export async function knowledgeApiFetch(path, init = {}) {
  const baseUrl = normalizeBaseUrl(process.env.KNOWLEDGE_API_BASE_URL);
  if (!baseUrl) {
    throw new Error("KNOWLEDGE_API_BASE_URL is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: knowledgeApiHeaders(init.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Knowledge API request failed: ${response.status} ${body}`);
  }

  return response;
}

function inferDocumentType(document) {
  const uri = String(document.source_uri ?? "").toLowerCase();
  const title = String(document.title ?? "").toLowerCase();
  if (uri.endsWith(".txt") || title.endsWith(".txt") || document.source_type === "manual_note") return "TXT";
  return "Markdown";
}

function formatKstDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapDocumentSummary(document) {
  const chunkCount = Number(document.chunk_count) || 0;
  const metadata = document.metadata || {};
  const characterCount = Number(metadata.character_count) || 0;
  const status = chunkCount > 0 || metadata.rag_status === "vector" ? "vector" : "loaded";

  return {
    id: document.id,
    name: document.title || document.source_uri || document.id,
    type: inferDocumentType(document),
    source: sourceLabels[document.source_type] || document.source_type || "-",
    chunks: chunkCount ? `${chunkCount}개` : "-",
    characters: characterCount ? characterCount.toLocaleString("ko-KR") : "-",
    status,
    processedAt: formatKstDate(document.updated_at || document.ingested_at),
    sourceType: document.source_type,
    sourceUri: document.source_uri,
  };
}

function summarizeKnowledge(documents) {
  const summary = { total: documents.length, loaded: 0, vector: 0, failed: 0 };
  for (const document of documents) {
    if (document.status === "vector") summary.vector += 1;
    else if (document.status === "failed") summary.failed += 1;
    else summary.loaded += 1;
  }
  return summary;
}

export async function getKnowledgeDocuments() {
  if (!normalizeBaseUrl(process.env.KNOWLEDGE_API_BASE_URL)) return null;

  const response = await knowledgeApiFetch("/documents");
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Knowledge API documents response must be an array");
  }

  return payload.map(mapDocumentSummary);
}

export async function getKnowledgeSnapshot(seed) {
  const documents = await getKnowledgeDocuments();
  if (!documents) return {};

  return {
    documents,
    knowledgeSummary: summarizeKnowledge(documents),
    uploadFiles: seed.uploadFiles,
  };
}

export async function uploadKnowledgeDocument(formData) {
  const response = await knowledgeApiFetch("/documents/upload", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function vectorizeKnowledgeDocument(sourceId) {
  const response = await knowledgeApiFetch(`/documents/${encodeURIComponent(sourceId)}/vectorize`, {
    method: "POST",
  });
  return response.json();
}
