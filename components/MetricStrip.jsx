import { metricClass } from "../lib/status";

export default function MetricStrip({ items, label = "핵심 상태 지표" }) {
  return (
    <dl className="metric-strip metric-strip--status" aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className={`metric-card ${metricClass(item.status)}`}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
