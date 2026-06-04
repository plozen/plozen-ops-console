import { NextResponse } from "next/server";
import { vectorizeKnowledgeDocument } from "../../../../../../lib/knowledge-api";

export async function POST(_request, { params }) {
  try {
    const { sourceId } = await params;
    const result = await vectorizeKnowledgeDocument(sourceId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("KNOWLEDGE_VECTORIZE_PROXY_FAILED", error);
    return NextResponse.json({ error: "문서 벡터 생성에 실패했습니다." }, { status: 502 });
  }
}
