import { useEffect, useState } from "react";
import Login from "./Login";
import Student from "./Student";
import Admin from "./Admin";

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token
      ? { token, role: localStorage.getItem("role"), name: localStorage.getItem("name") }
      : null;
  });
  const [pod, setPod] = useState("");

  const logout = () => {
    localStorage.clear();
    setAuth(null);
  };

  const login = (d) => {
    localStorage.setItem("token", d.token);
    localStorage.setItem("role", d.role);
    localStorage.setItem("name", d.name);
    setAuth({ token: d.token, role: d.role, name: d.name });
  };

  useEffect(() => {
    const onPod = (e) => setPod(e.detail);
    window.addEventListener("pod", onPod);
    window.addEventListener("logout", logout);
    return () => {
      window.removeEventListener("pod", onPod);
      window.removeEventListener("logout", logout);
    };
  }, []);

  return (
    <>
      <header className="nav">
        <div className="brand">🎓 Placement Portal</div>
        <div className="right">
          {pod && <span className="pod">Served by: {pod}</span>}
          {auth && (
            <>
              <span>{auth.name} ({auth.role})</span>
              <button className="btn small" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>
      <main className="container">
        {!auth ? <Login onLogin={login} /> : auth.role === "ADMIN" ? <Admin /> : <Student />}
      </main>
    </>
  );
}