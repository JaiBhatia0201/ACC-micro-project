import { useState } from "react";
import api, { errMsg } from "./api";
import { Notice } from "./ui";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [n, setN] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r =
        mode === "login"
          ? await api.post("/auth/login", { email: f.email, password: f.password })
          : await api.post("/auth/register", f);
      onLogin(r.data);
    } catch (err) {
      setN({ type: "error", text: errMsg(err) });
    }
  };

  return (
    <div className="card narrow">
      <h2>{mode === "login" ? "Login" : "Student Registration"}</h2>
      <Notice n={n} />
      <form onSubmit={submit} className="form">
        {mode === "register" && (
          <label>Name<input required value={f.name} onChange={set("name")} /></label>
        )}
        <label>Email<input required type="email" value={f.email} onChange={set("email")} /></label>
        <label>Password<input required type="password" value={f.password} onChange={set("password")} /></label>
        <button className="btn primary" type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <p className="muted">
        {mode === "login" ? "New student? " : "Already registered? "}
        <a href="#" onClick={(e) => { e.preventDefault(); setN(null); setMode(mode === "login" ? "register" : "login"); }}>
          {mode === "login" ? "Register here" : "Login"}
        </a>
      </p>
      <div className="hint">
        <b>Demo accounts</b><br />
        TPO: tpo@college.edu / admin123<br />
        Student: student1@college.edu / student123
      </div>
    </div>
  );
}