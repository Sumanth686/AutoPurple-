from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import runs, hunting, iam, cases

app = FastAPI(title="AutoPurple API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AutoPurple API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(runs.router)
app.include_router(hunting.router)
app.include_router(iam.router)
app.include_router(cases.router)
