import axios from "axios";

// Relative base URL: works with the Vite proxy, Docker/NGINX and Kubernetes Ingress.
const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => {
    const pod = res.headers["x-pod-name"];
    if (pod) window.dispatchEvent(new CustomEvent("pod", { detail: pod }));
    return res;
  },
  (err) => {
    const pod = err.response?.headers?.["x-pod-name"];
    if (pod) window.dispatchEvent(new CustomEvent("pod", { detail: pod }));
    const isAuthCall = (err.config?.url || "").startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event("logout"));
    }
    return Promise.reject(err);
  }
);

export function errMsg(e) {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join("; ");
  return e?.message || "Something went wrong";
}

// PDFs need the auth header, so fetch as a blob and open it in a new tab.
export async function openPdf(url) {
  try {
    const r = await api.get(url, { responseType: "blob" });
    window.open(URL.createObjectURL(r.data), "_blank");
  } catch (e) {
    alert("Could not open resume: " + errMsg(e));
  }
}

export default api;