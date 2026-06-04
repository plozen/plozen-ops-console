import { NextResponse } from "next/server";
import { getKnowledgeDocuments } from "../../../../lib/knowledge-api";

export async function GET() {
  try {
    const documents = await getKnowledgeDocuments();
    return NextResponse.json({ documents: documents ?? [] });
  } catch (error) {
    console.error("KNOWLEDGE_DOCUMENTS_PROXY_FAILED", error);
    return NextResponse.json({ error: "문서 목록 조회에 실패했습니다." }, { status: 502 });
  }
}
