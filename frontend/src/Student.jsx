import { useEffect, useState } from "react";
import api, { errMsg, openPdf } from "./api";
import { Notice, Badge, Tabs, csvToList } from "./ui";

const BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Electronics and Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
];

function Profile() {
  const [f, setF] = useState(null);
  const [n, setN] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    api.get("/students/profile")
      .then((r) => {
        const p = r.data;
        setF({
          ...p,
          skills: p.skills.join(", "),
          branch: p.branch || "",
          semester: p.semester || 1,
          cgpa: p.cgpa ?? 0,
          backlogs: p.backlogs ?? 0,
          phone: p.phone || "",
        });
      })
      .catch((err) => setN({ type: "error", text: errMsg(err) }));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/students/profile", {
        name: f.name,
        branch: f.branch,
        semester: Number(f.semester),
        cgpa: Number(f.cgpa),
        backlogs: Number(f.backlogs),
        skills: csvToList(f.skills),
        phone: f.phone,
      });
      setN({ type: "ok", text: "Profile saved" });
    } catch (err) {
      setN({ type: "error", text: errMsg(err) });
    }
  };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await api.post("/students/resume", fd);
      setF((x) => ({ ...x, has_resume: r.data.has_resume, resume_name: r.data.resume_name }));
      setN({ type: "ok", text: "Resume uploaded to MinIO" });
    } catch (err) {
      setN({ type: "error", text: errMsg(err) });
    }
    e.target.value = "";
  };

  if (!f) return <div className="card"><Notice n={n} />Loading…</div>;

  return (
    <div className="card">
      <h3>My Profile</h3>
      <Notice n={n} />
      <form onSubmit={save} className="form grid2">
        <label>Name<input required value={f.name} onChange={set("name")} /></label>
        <label>Email<input disabled value={f.email} /></label>
        <label>Branch
          <select required value={f.branch} onChange={set("branch")}>
            <option value="">Select branch</option>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label>Semester<input type="number" min="1" max="8" value={f.semester} onChange={set("semester")} /></label>
        <label>CGPA<input type="number" step="0.01" min="0" max="10" value={f.cgpa} onChange={set("cgpa")} /></label>
        <label>Active backlogs<input type="number" min="0" value={f.backlogs} onChange={set("backlogs")} /></label>
        <label>Skills (comma separated)<input value={f.skills} onChange={set("skills")} placeholder="Java, Python, SQL" /></label>
        <label>Phone<input value={f.phone} onChange={set("phone")} /></label>
        <div><button className="btn primary" type="submit">Save profile</button></div>
      </form>

      <h3>Resume (PDF)</h3>
      <p>
        {f.has_resume ? (
          <>Uploaded: <b>{f.resume_name}</b>{" "}
            <button className="btn small" onClick={() => openPdf("/students/resume")}>View</button></>
        ) : "No resume uploaded yet."}
      </p>
      <input type="file" accept="application/pdf" onChange={upload} />
    </div>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [n, setN] = useState(null);

  const load = () =>
    api.get("/jobs").then((r) => setJobs(r.data))
      .catch((err) => setN({ type: "error", text: errMsg(err) }));
  useEffect(() => { load(); }, []);

  const apply = async (id) => {
    try {
      await api.post(`/jobs/${id}/apply`);
      setN({ type: "ok", text: "Application submitted" });
      load();
    } catch (err) {
      setN({ type: "error", text: errMsg(err) });
    }
  };

  return (
    <div>
      <Notice n={n} />
      {jobs.length === 0 && <div className="card">No open jobs.</div>}
      {jobs.map((j) => (
        <div className="card" key={j.id}>
          <div className="row between">
            <div>
              <h3>{j.title}</h3>
              <div className="muted">{j.company_name} · Deadline: {j.deadline || "—"}</div>
            </div>
            {j.eligibility.eligible
              ? <span className="badge OFFERED">Eligible</span>
              : <span className="badge REJECTED">Not eligible</span>}
          </div>
          <p>{j.description}</p>
          <div className="muted">
            Min CGPA: {j.minimum_cgpa} · Max backlogs: {j.maximum_backlogs} · Branches:{" "}
            {j.eligible_branches.join(", ") || "All"} · Skills: {j.required_skills.join(", ") || "None"}
          </div>
          {!j.eligibility.eligible && (
            <ul className="reasons">{j.eligibility.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          )}
          <div className="actions">
            {j.application_status ? (
              <>Status: <Badge status={j.application_status} /></>
            ) : (
              <button className="btn primary" disabled={!j.eligibility.eligible} onClick={() => apply(j.id)}>
                Apply
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Applications() {
  const [apps, setApps] = useState([]);
  useEffect(() => { api.get("/applications").then((r) => setApps(r.data)); }, []);
  return (
    <div className="card">
      <h3>My Applications</h3>
      {apps.length === 0 ? <p>You haven't applied to any jobs yet.</p> : (
        <table>
          <thead><tr><th>Company</th><th>Role</th><th>Applied on</th><th>Status</th></tr></thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td>{a.company_name}</td>
                <td>{a.job_title}</td>
                <td>{new Date(a.application_date + "Z").toLocaleDateString()}</td>
                <td><Badge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Student() {
  const [tab, setTab] = useState("jobs");
  return (
    <>
      <Tabs
        tabs={[["jobs", "Jobs"], ["apps", "My Applications"], ["profile", "My Profile"]]}
        value={tab}
        onChange={setTab}
      />
      {tab === "jobs" && <Jobs />}
      {tab === "apps" && <Applications />}
      {tab === "profile" && <Profile />}
    </>
  );
}