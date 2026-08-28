import sys
import logging
from app.core.config import settings


def setup_logging() -> None:
    """
    Configures structured logging for the AURICLE FastAPI application.
    Logs formatted info/warning/error messages without leaking sensitive credentials.
    """
    log_level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Silence verbose third-party loggers if necessary
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


logger = logging.getLogger("auricle.backend")
