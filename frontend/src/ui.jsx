export const csvToList = (s) =>
  (s || "").split(",").map((x) => x.trim()).filter(Boolean);

export function Notice({ n }) {
  if (!n) return null;
  return <div className={"notice " + n.type}>{n.text}</div>;
}

export function Badge({ status }) {
  return <span className={"badge " + status}>{status}</span>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(([k, label]) => (
        <button key={k} className={k === value ? "tab active" : "tab"} onClick={() => onChange(k)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export const STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"];