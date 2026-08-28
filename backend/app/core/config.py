from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, computed_field


class Settings(BaseSettings):
    """
    Central configuration layer for AURICLE Backend using pydantic-settings.
    All settings are loaded from environment variables or .env file.
    Safe development defaults are provided where appropriate.
    NEVER embed production secrets in this file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = Field(default="AURICLE Backend")
    APP_ENV: str = Field(default="development")
    API_PREFIX: str = Field(default="/api")

    # ── CORS ──────────────────────────────────────────────────────────────────
    FRONTEND_ORIGIN: str = Field(default="http://localhost:5173")

    @computed_field
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Parse comma-separated origins string into list."""
        if not self.FRONTEND_ORIGIN:
            return ["http://localhost:5173"]
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://auricle:auricle_dev@localhost:5432/auricle_db"
    )

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = Field(
        default="insecure-dev-secret-change-in-production",
        description="Secret key for signing JWT tokens. MUST be changed in production.",
    )
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30)

    # ── Google OAuth ──────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = Field(
        default="",
        description="Google OAuth 2.0 Client ID for server-side ID-token verification.",
    )


settings = Settings()
