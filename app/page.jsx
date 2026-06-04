import DashboardView from "../components/dashboard/DashboardView";
import MetricStrip from "../components/MetricStrip";
import PageHeader from "../components/PageHeader";
import { getOpsSnapshot } from "../lib/snapshot";

export const dynamic = "force-dynamic";

function dashboardMetrics(snapshot) {
  return [
    { label: "Resource", value: snapshot.overview.resourceStatus.label, status: snapshot.overview.resourceStatus.status },
    { label: "Service", value: snapshot.overview.serviceStatus.label, status: snapshot.overview.serviceStatus.status },
    { label: "Automation", value: snapshot.overview.automationStatus.label, status: snapshot.overview.automationStatus.status },
    { label: "Log", value: snapshot.overview.logStatus.label, status: snapshot.overview.logStatus.status },
  ];
}

export default async function DashboardPage() {
  const snapshot = await getOpsSnapshot();

  return (
    <>
      <PageHeader
        kicker="Admin Overview"
        title="PLOZEN 운영 Dashboard"
        description={`${snapshot.serverLabel ?? "현재 서버"}의 컴퓨팅 자원, 서비스, 자동화 상태를 시스템 관리자 관점에서 확인합니다.`}
        snapshotDate={snapshot.snapshotDate}
      />
      <MetricStrip items={dashboardMetrics(snapshot)} />
      <section className="route-panel is-active" id="dashboard-panel" data-panel="dashboard">
        <DashboardView snapshot={snapshot} />
      </section>
    </>
  );
}
