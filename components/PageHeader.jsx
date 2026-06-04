import RefreshButton from "./RefreshButton";

export default function PageHeader({ kicker, title, description, snapshotDate }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow" id="page-kicker">
          {kicker}
        </p>
        <h1 id="page-title">{title}</h1>
        <p id="page-description">{description}</p>
      </div>
      <div className="header-actions" aria-label="상태 갱신">
        <RefreshButton snapshotDate={snapshotDate} />
      </div>
    </header>
  );
}
