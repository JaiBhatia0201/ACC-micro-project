import { useEffect, useState } from "react";
import api, { errMsg, openPdf } from "./api";
import { Notice, Badge, Tabs, csvToList, STATUSES } from "./ui";

function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/stats").then((r) => setS(r.data)); }, []);
  if (!s) return <div className="card">Loading…</div>;
  const items = [
    ["Total Students", s.total_students],
    ["Active Jobs", s.active_jobs],
    ["Total Applications", s.total_applications],
    ["Shortlisted", s.shortlisted],
    ["Placed (Offered)", s.placed],
  ];
  return (
    <div className="stats">
      {items.map(([label, v]) => (
        <div className="stat" key={label}><div className="num">{v}</div><div>{label}</div></div>
      ))}
    </div>
  );
}

const emptyCompany = { name: "", description: "", website: "", industry: "" };

function Companies() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(emptyCompany);
  const [editId, setEditId] = useState(null);
  const [n, setN] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const load = () => api.get("/companies").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/companies/${editId}`, f);
      else await api.post("/companies", f);
      setN({ type: "ok", text: editId ? "Company updated" : "Company added" });
      setF(emptyCompany); setEditId(null); load();
    } catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  const del = async (id) => {
    if (!confirm("Delete this company and all its jobs?")) return;
    try { await api.delete(`/companies/${id}`); load(); }
    catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  return (
    <div>
      <div className="card">
        <h3>{editId ? "Edit company" : "Add company"}</h3>
        <Notice n={n} />
        <form onSubmit={submit} className="form grid2">
          <label>Name<input required value={f.name} onChange={set("name")} /></label>
          <label>Industry<input value={f.industry} onChange={set("industry")} /></label>
          <label>Website<input value={f.website} onChange={set("website")} /></label>
          <label>Description<input value={f.description} onChange={set("description")} /></label>
          <div>
            <button className="btn primary" type="submit">{editId ? "Update" : "Add"}</button>{" "}
            {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setF(emptyCompany); }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Industry</th><th>Website</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td><td>{c.industry}</td><td>{c.website}</td>
                <td className="right">
                  <button className="btn small" onClick={() => { setEditId(c.id); setF({ name: c.name, description: c.description, website: c.website, industry: c.industry }); }}>Edit</button>{" "}
                  <button className="btn small danger" onClick={() => del(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptyJob = {
  company_id: "", title: "", description: "", minimum_cgpa: 0, maximum_backlogs: 0,
  eligible_branches: "", required_skills: "", deadline: "", status: "OPEN",
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [f, setF] = useState(emptyJob);
  const [editId, setEditId] = useState(null);
  const [n, setN] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => {
    api.get("/jobs").then((r) => setJobs(r.data));
    api.get("/companies").then((r) => setCompanies(r.data));
  };
  useEffect(() => { load(); }, []);

  const payload = (job) => ({
    company_id: Number(job.company_id),
    title: job.title,
    description: job.description,
    minimum_cgpa: Number(job.minimum_cgpa),
    maximum_backlogs: Number(job.maximum_backlogs),
    eligible_branches: Array.isArray(job.eligible_branches) ? job.eligible_branches : csvToList(job.eligible_branches),
    required_skills: Array.isArray(job.required_skills) ? job.required_skills : csvToList(job.required_skills),
    deadline: job.deadline || null,
    status: job.status,
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/jobs/${editId}`, payload(f));
      else await api.post("/jobs", payload(f));
      setN({ type: "ok", text: editId ? "Job updated" : "Job published" });
      setF(emptyJob); setEditId(null); load();
    } catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  const toggle = async (j) => {
    try { await api.put(`/jobs/${j.id}`, payload({ ...j, status: j.status === "OPEN" ? "CLOSED" : "OPEN" })); load(); }
    catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  const del = async (id) => {
    if (!confirm("Delete this job and its applications?")) return;
    try { await api.delete(`/jobs/${id}`); load(); }
    catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  const edit = (j) => {
    setEditId(j.id);
    setF({ ...j, eligible_branches: j.eligible_branches.join(", "), required_skills: j.required_skills.join(", "), deadline: j.deadline || "" });
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className="card">
        <h3>{editId ? "Edit job" : "Create job posting"}</h3>
        <Notice n={n} />
        <form onSubmit={submit} className="form grid2">
          <label>Company
            <select required value={f.company_id} onChange={set("company_id")}>
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Job title<input required value={f.title} onChange={set("title")} /></label>
          <label>Minimum CGPA<input type="number" step="0.1" min="0" max="10" value={f.minimum_cgpa} onChange={set("minimum_cgpa")} /></label>
          <label>Maximum backlogs<input type="number" min="0" value={f.maximum_backlogs} onChange={set("maximum_backlogs")} /></label>
          <label>Eligible branches (comma separated, blank = all)
            <input value={f.eligible_branches} onChange={set("eligible_branches")} placeholder="Computer Engineering, Information Technology" />
          </label>
          <label>Required skills (comma separated)
            <input value={f.required_skills} onChange={set("required_skills")} placeholder="Java, SQL" />
          </label>
          <label>Deadline<input type="date" value={f.deadline} onChange={set("deadline")} /></label>
          <label>Description<input value={f.description} onChange={set("description")} /></label>
          <div>
            <button className="btn primary" type="submit">{editId ? "Update job" : "Publish job"}</button>{" "}
            {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setF(emptyJob); }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Company</th><th>Role</th><th>Criteria</th><th>Applicants</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.company_name}</td>
                <td>{j.title}</td>
                <td className="muted">CGPA ≥ {j.minimum_cgpa}, backlogs ≤ {j.maximum_backlogs}</td>
                <td>{j.applicants}</td>
                <td><Badge status={j.status} /></td>
                <td className="right">
                  <button className="btn small" onClick={() => edit(j)}>Edit</button>{" "}
                  <button className="btn small" onClick={() => toggle(j)}>{j.status === "OPEN" ? "Close" : "Reopen"}</button>{" "}
                  <button className="btn small danger" onClick={() => del(j.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Applicants() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [apps, setApps] = useState([]);
  const [n, setN] = useState(null);

  useEffect(() => { api.get("/jobs").then((r) => setJobs(r.data)); }, []);

  const load = (id) => {
    if (!id) { setApps([]); return; }
    api.get(`/jobs/${id}/applications`).then((r) => setApps(r.data))
      .catch((err) => setN({ type: "error", text: errMsg(err) }));
  };

  const pick = (e) => { setJobId(e.target.value); load(e.target.value); };

  const setStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setN({ type: "ok", text: `Status updated to ${status}` });
      load(jobId);
    } catch (err) { setN({ type: "error", text: errMsg(err) }); }
  };

  return (
    <div className="card">
      <h3>Applicants</h3>
      <Notice n={n} />
      <label className="inline">Job:{" "}
        <select value={jobId} onChange={pick}>
          <option value="">Select a job</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.company_name} – {j.title}</option>)}
        </select>
      </label>
      {jobId && apps.length === 0 && <p>No applicants yet.</p>}
      {apps.length > 0 && (
        <table>
          <thead><tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Backlogs</th><th>Skills</th><th>Resume</th><th>Eligible</th><th>Status</th></tr></thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td>{a.student.name}<div className="muted">{a.student.email}</div></td>
                <td>{a.student.branch}</td>
                <td>{a.student.cgpa}</td>
                <td>{a.student.backlogs}</td>
                <td>{a.student.skills.join(", ")}</td>
                <td>{a.student.has_resume
                  ? <button className="btn small" onClick={() => openPdf(`/applications/${a.id}/resume`)}>View</button>
                  : "—"}</td>
                <td>{a.eligibility.eligible ? "Yes" : "No"}</td>
                <td>
                  <Badge status={a.status} />{" "}
                  <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("dash");
  return (
    <>
      <Tabs
        tabs={[["dash", "Dashboard"], ["companies", "Companies"], ["jobs", "Jobs"], ["applicants", "Applicants"]]}
        value={tab}
        onChange={setTab}
      />
      {tab === "dash" && <Dashboard />}
      {tab === "companies" && <Companies />}
      {tab === "jobs" && <Jobs />}
      {tab === "applicants" && <Applicants />}
    </>
  );
}