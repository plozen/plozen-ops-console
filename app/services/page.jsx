import MetricStrip from "../../components/MetricStrip";
import PageHeader from "../../components/PageHeader";
import PortPolicy from "../../components/service/PortPolicy";
import ServiceRegistry from "../../components/service/ServiceRegistry";
import { getOpsSnapshot } from "../../lib/snapshot";

export const dynamic = "force-dynamic";

function serviceMetrics(snapshot) {
  return [
    { label: "정상", value: `${snapshot.serviceSummary.ok}개`, status: "ok" },
    { label: "주의", value: `${snapshot.serviceSummary.warn}개`, status: "warn" },
    { label: "에러", value: `${snapshot.serviceSummary.error}개`, status: "error" },
    { label: "미확인", value: `${snapshot.serviceSummary.unknown}개`, status: "unknown" },
  ];
}

export default async function ServicesPage() {
  const snapshot = await getOpsSnapshot();

  return (
    <>
      <PageHeader
        kicker="Service Registry"
        title="13번 서버 Service 상태"
        description="Docker 컨테이너와 OS/systemd 서비스를 한 화면에서 확인하고, 운영 포트 정책을 같은 흐름에서 추적합니다."
        snapshotDate={snapshot.snapshotDate}
      />
      <MetricStrip items={serviceMetrics(snapshot)} />
      <section className="route-panel is-active" id="services-panel" data-panel="services">
        <ServiceRegistry services={snapshot.services ?? []} />
        <PortPolicy items={snapshot.portPolicy ?? []} />
      </section>
    </>
  );
}
