import sys
from pathlib import Path

from mangum import Mangum

backend_path = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app  # noqa: E402

handler = Mangum(app, lifespan="off")