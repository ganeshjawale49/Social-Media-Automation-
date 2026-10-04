import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from app.core.config import settings


def hash_password(password: str) -> str:
    # Truncate to 72 bytes if needed per bcrypt spec
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


# --- Token Encryption & Decryption ---
import base64
import hashlib
import secrets
from cryptography.fernet import Fernet


def get_fernet_key() -> bytes:
    key_source = getattr(settings, "ENCRYPTION_KEY", None) or settings.SECRET_KEY
    hashed = hashlib.sha256(key_source.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(hashed)


def encrypt_token(raw_token: str) -> str:
    if not raw_token:
        return ""
    f = Fernet(get_fernet_key())
    return f.encrypt(raw_token.encode("utf-8")).decode("utf-8")


def decrypt_token(encrypted_token: str) -> str:
    if not encrypted_token:
        return ""
    f = Fernet(get_fernet_key())
    return f.decrypt(encrypted_token.encode("utf-8")).decode("utf-8")


# --- OAuth CSRF State Security ---
def create_oauth_state(workspace_id: Any, user_id: Any, provider: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    payload = {
        "exp": expire,
        "workspace_id": str(workspace_id),
        "user_id": str(user_id),
        "provider": provider.lower(),
        "nonce": secrets.token_hex(8),
        "type": "oauth_state"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_oauth_state(state_token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(state_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "oauth_state":
            return None
        return payload
    except JWTError:
        return None

