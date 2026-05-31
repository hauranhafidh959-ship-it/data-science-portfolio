"""
FastAPI backend for the portfolio.
Deploy on Render.com (free Web Service).

Endpoints:
  GET  /                -> health
  GET  /api/projects    -> list of projects (for the portfolio gallery)
  POST /api/contact     -> submit contact form (sent via Resend)
"""
import os
import logging
from datetime import datetime
from typing import List, Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("portfolio")

app = FastAPI(title="Portfolio API", version="1.1.0")

# ---- CORS ----
# NOTE: Set the ALLOWED_ORIGINS environment variable on Render to your Vercel frontend URL.
# Example: https://your-portfolio.vercel.app
# Multiple origins can be separated by commas.
# The localhost entries below are for local development only.
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500"
)
ALLOWED = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ---- Resend config ----
# NOTE: Set these environment variables on Render:
#   RESEND_API_KEY  - your Resend API key from resend.com
#   MAIL_TO         - the inbox you want contact form emails delivered to
#   MAIL_FROM       - a verified sender address on Resend (default uses Resend sandbox)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
MAIL_TO = os.getenv("MAIL_TO", "hauranhafidh959@gmail.com")
MAIL_FROM = os.getenv("MAIL_FROM", "onboarding@resend.dev")


class ContactIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: Optional[str] = Field("Portfolio contact", max_length=200)
    message: str = Field(..., min_length=5, max_length=4000)


class Project(BaseModel):
    id: str
    title: str
    tag: str
    description: str
    stack: List[str]
    image: str
    url: Optional[str] = None


PROJECTS: List[Project] = [
    Project(id="customer-churn", title="Customer Churn Prediction", tag="Machine Learning",
            description="Gradient-boosted classifier predicting telecom churn with 89% ROC-AUC.",
            stack=["Python", "XGBoost", "SHAP"], image="images/projects/machine-learning.jpg"),
    Project(id="covid-dashboard", title="COVID-19 Analytics Dashboard", tag="Data Visualisation",
            description="Interactive Streamlit + Plotly dashboard across 50+ countries.",
            stack=["Streamlit", "Plotly", "Pandas"], image="images/projects/data-visualization.jpg"),
    Project(id="sentiment-nlp", title="Sentiment Analysis API", tag="NLP",
            description="Fine-tuned transformer deployed as a FastAPI microservice.",
            stack=["PyTorch", "HuggingFace", "FastAPI"], image="images/projects/nlp.jpg"),
]


@app.get("/")
def health():
    return {"status": "ok", "service": "portfolio-api", "time": datetime.utcnow().isoformat()}


@app.get("/api/projects", response_model=List[Project])
def list_projects():
    return PROJECTS


def _send_via_resend(payload: ContactIn) -> None:
    if not RESEND_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Email service not configured — RESEND_API_KEY environment variable is missing on Render."
        )

    name = payload.name.strip()
    email = payload.email.strip()
    subject = (payload.subject or "Portfolio contact").strip()
    message = payload.message.strip()

    body_html = f"""
        <h2>New message from your portfolio</h2>
        <p><b>Name:</b> {name}</p>
        <p><b>Email:</b> {email}</p>
        <p><b>Subject:</b> {subject}</p>
        <p><b>Message:</b></p>
        <p>{message}</p>
    """

    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": f"Portfolio <{MAIL_FROM}>",
                "to": [MAIL_TO],
                "reply_to": email,
                "subject": f"Portfolio: {subject} — {name}",
                "text": f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\n{message}",
                "html": body_html,
            },
            timeout=15,
        )
    except Exception as e:
        log.exception("Resend request failed")
        raise HTTPException(status_code=502, detail=f"Email delivery failed: {e}")

    if r.status_code not in (200, 202):
        log.error("Resend error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=502, detail=f"Resend error {r.status_code}")


@app.post("/api/contact")
def submit_contact(payload: ContactIn):
    log.info("New contact: %s <%s> - %s", payload.name, payload.email, payload.subject)
    _send_via_resend(payload)
    return {"ok": True, "success": True, "message": "Thanks — I'll get back to you soon."}


@app.post("/contact")
def submit_contact_alias(payload: ContactIn):
    return submit_contact(payload)
