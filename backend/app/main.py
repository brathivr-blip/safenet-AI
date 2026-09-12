from datetime import datetime, timezone
from math import atan2, cos, radians, sin, sqrt
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings

app = FastAPI(
    title="SafeNet AI",
    description=(
        "Intelligent Emergency Response & Community Safety Platform — decision-support "
        "prototype. Not a replacement for official emergency dispatch."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)


class RegisterRequest(LoginRequest):
    name: str = Field(min_length=2)


class EmergencyRequest(BaseModel):
    description: str = Field(min_length=8)
    category: str = "Medical"
    latitude: float
    longitude: float


class StatusRequest(BaseModel):
    status: str


users = {
    "demo@safenet.ai": {"id": "usr_demo", "name": "Demo Citizen", "role": "citizen", "password": "safenet"},
}
emergencies: dict[str, dict] = {}

resources = [
    {"id": "amb-01", "type": "Ambulance", "name": "Unit 04", "status": "Available", "eta": "4 min", "latitude": 40.714, "longitude": -74.006},
    {"id": "hosp-01", "type": "Hospital", "name": "Central City Medical", "status": "Receiving", "eta": "8 min", "latitude": 40.719, "longitude": -74.001},
    {"id": "fire-01", "type": "Fire & Rescue", "name": "Station 7", "status": "Available", "eta": "6 min", "latitude": 40.709, "longitude": -74.011},
]


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def triage(description: str) -> tuple[str, str, str]:
    text = description.lower()
    critical_words = ("unconscious", "not breathing", "severe bleeding", "heart attack")
    high_words = ("fire", "trapped", "stroke", "accident", "chest pain")
    if any(word in text for word in critical_words):
        return "CRITICAL", "Immediate medical response recommended", "Emergency medical services alerted"
    if any(word in text for word in high_words):
        return "HIGH", "Rapid responder dispatch recommended", "Nearest response unit identified"
    return "MEDIUM", "Prompt assistance recommended", "Local response network notified"


def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius = 6371
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    return round(earth_radius * 2 * atan2(sqrt(a), sqrt(1 - a)), 1)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "env": settings.app_env,
        "demo_mode": settings.demo_mode,
    }


@app.post("/api/auth/login")
def login(payload: LoginRequest):
    user = users.get(payload.email.lower())
    if not user or user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": f"demo-token-{user['id']}", "user": {k: user[k] for k in ("id", "name", "role")}}


@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    email = payload.email.lower()
    if email in users:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {"id": f"usr_{uuid4().hex[:8]}", "name": payload.name, "role": "citizen", "password": payload.password}
    users[email] = user
    return {"token": f"demo-token-{user['id']}", "user": {k: user[k] for k in ("id", "name", "role")}}


@app.post("/api/emergencies")
def create_emergency(payload: EmergencyRequest):
    priority, recommendation, notification = triage(payload.description)
    emergency_id = f"SN-{uuid4().hex[:6].upper()}"
    nearby = sorted(
        [{**resource, "distance_km": distance_km(payload.latitude, payload.longitude, resource["latitude"], resource["longitude"])} for resource in resources],
        key=lambda resource: resource["distance_km"],
    )
    emergency = {
        "id": emergency_id,
        "description": payload.description,
        "category": payload.category,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "priority": priority,
        "recommendation": recommendation,
        "notification": notification,
        "status": "Dispatched",
        "created_at": now(),
        "responder": {"name": "Unit 04", "eta": nearby[0]["eta"], "status": "En route"},
        "hospital": {"name": "Central City Medical", "status": "Pre-alert sent"},
        "nearby_resources": nearby,
        "timeline": [
            {"label": "Emergency reported", "time": now(), "done": True},
            {"label": "AI triage completed", "time": now(), "done": True},
            {"label": "Responder assigned", "time": now(), "done": True},
            {"label": "Hospital notification", "time": now(), "done": True},
        ],
    }
    emergencies[emergency_id] = emergency
    return emergency


@app.get("/api/emergencies/{emergency_id}")
def get_emergency(emergency_id: str):
    emergency = emergencies.get(emergency_id)
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency


@app.patch("/api/emergencies/{emergency_id}/status")
def update_emergency_status(emergency_id: str, payload: StatusRequest):
    emergency = emergencies.get(emergency_id)
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    emergency["status"] = payload.status
    emergency["timeline"].append({"label": f"Status updated to {payload.status}", "time": now(), "done": True})
    return emergency


@app.get("/api/dashboard/summary")
def dashboard_summary():
    priority_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0}
    for emergency in emergencies.values():
        priority_counts[emergency["priority"]] += 1
    return {
        "active_incidents": len(emergencies),
        "critical_incidents": priority_counts["CRITICAL"],
        "responders_available": sum(resource["status"] == "Available" for resource in resources),
        "hospitals_receiving": sum(resource["type"] == "Hospital" and resource["status"] == "Receiving" for resource in resources),
        "priority_counts": priority_counts,
        "recent": list(emergencies.values())[-5:][::-1],
    }


# Routers are registered here as each module is built.
# from app.routers import auth, emergencies, reports, resources, ai, alerts, dashboard
# app.include_router(auth.router)
# app.include_router(emergencies.router)
# ...
