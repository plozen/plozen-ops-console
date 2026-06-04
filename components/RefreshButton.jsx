"use client";

export default function RefreshButton({ snapshotDate }) {
  const label = snapshotDate ? `새로고침, 기준 ${snapshotDate}` : "새로고침";

  return (
    <button className="header-refresh-button" type="button" aria-label={label} title={label} onClick={() => window.location.reload()}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
        <path d="M20 4v6h-6" />
      </svg>
    </button>
  );
}
