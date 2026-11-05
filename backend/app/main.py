import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import models  # noqa: F401  (registers tables)
from .config import POD_NAME
from .database import engine, Base, SessionLocal
from .seed import seed
from . import storage
from .routers import auth, students, companies, jobs, applications, stats


def init_db():
    """Wait for Postgres, create tables, seed. An advisory lock keeps
    multiple replicas from racing each other on startup."""
    for attempt in range(30):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT pg_advisory_lock(42)"))
                try:
                    Base.metadata.create_all(bind=conn)
                    conn.commit()
                    db = SessionLocal()
                    try:
                        seed(db)
                    finally:
                        db.close()
                finally:
                    conn.execute(text("SELECT pg_advisory_unlock(42)"))
                    conn.commit()
            print("Database ready")
            return
        except Exception as e:
            print(f"DB not ready (attempt {attempt + 1}/30): {e}")
            time.sleep(2)
    raise RuntimeError("Could not connect to the database")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        storage.ensure_bucket()
    except Exception as e:
        print(f"MinIO not ready yet, will retry on first upload: {e}")
    yield


app = FastAPI(title="Placement Management System", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"],
                   allow_headers=["*"], expose_headers=["X-Pod-Name"])


@app.middleware("http")
async def add_pod_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Pod-Name"] = POD_NAME
    return response


@app.get("/api/health", tags=["ops"])
def health():
    return {"status": "ok", "pod": POD_NAME}


for r in (auth, students, companies, jobs, applications, stats):
    app.include_router(r.router)