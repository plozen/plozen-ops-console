import MetricStrip from "../../components/MetricStrip";
import KnowledgeDatabaseView from "../../components/knowledge/KnowledgeDatabaseView";
import PageHeader from "../../components/PageHeader";
import { getOpsSnapshot } from "../../lib/snapshot";

export const dynamic = "force-dynamic";

function knowledgeMetrics(snapshot) {
  return [
    { label: "전체 문서", value: snapshot.knowledgeSummary.total, status: "unknown" },
    { label: "적재", value: snapshot.knowledgeSummary.loaded, status: "warn" },
    { label: "벡터", value: snapshot.knowledgeSummary.vector, status: "ok" },
    { label: "실패", value: snapshot.knowledgeSummary.failed, status: "error" },
  ];
}

export default async function KnowledgePage() {
  const snapshot = await getOpsSnapshot();

  return (
    <>
      <PageHeader
        kicker="VectorDB"
        title="VectorDB 관리"
        description="VectorDB 문서 적재 상태, 조각 수, 벡터 생성 여부를 확인합니다."
        snapshotDate={snapshot.snapshotDate}
      />
      <MetricStrip items={knowledgeMetrics(snapshot)} />
      <section className="route-panel is-active" id="knowledge-panel" data-panel="knowledge">
        <KnowledgeDatabaseView documents={snapshot.documents} uploadFiles={snapshot.uploadFiles} />
      </section>
    </>
  );
}
