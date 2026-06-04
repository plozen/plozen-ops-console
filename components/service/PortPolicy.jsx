export default function PortPolicy({ items }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="data-section compact-section service-section port-policy-section" aria-label="포트 정책">
      <header>
        <div>
          <p className="eyebrow">Port Policy</p>
          <h2>포트 정책</h2>
        </div>
      </header>
      <ul className="policy-list port-policy-list" id="port-policy-list">
        {rows.map((item) => (
          <li key={item.range}>
            <strong>{item.range}</strong>
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
