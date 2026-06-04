import { NextResponse } from "next/server";
import { uploadKnowledgeDocument } from "../../../../lib/knowledge-api";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await uploadKnowledgeDocument(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("KNOWLEDGE_UPLOAD_PROXY_FAILED", error);
    return NextResponse.json({ error: "문서 업로드에 실패했습니다." }, { status: 502 });
  }
}
