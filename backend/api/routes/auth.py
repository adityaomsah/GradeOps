# auth.py
# Goal: Handle user registration and login, issue JWT tokens

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM="HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

users_db = {} # currently using in memory dictionary, later need to store in database using SQL

class UserRegisterRequest(BaseModel):
    user_email_id: EmailStr
    user_password: str
    user_role: str

    @field_validator("user_role")
    @classmethod
    def validate_role(cls, value):
        value = value.lower()

        if value not in {"admin","instructor", "ta", "student"}:
            raise ValueError("Invalid role")

        return value

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": email, "role": role}
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
def create_first_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if admin_email and admin_email not in users_db:
        users_db[admin_email] = {
            "password_hash": hash_password(admin_password),
            "role": "admin"
        }
        print(f"✅ First admin created: {admin_email}")

create_first_admin()


@router.post("/register")
def register(user: UserRegisterRequest, current_user = Depends(get_current_user)):
    # RBAC
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can register users")

    if user.user_email_id in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    users_db[user.user_email_id] = {
        "password_hash": hash_password(user.user_password),
        "role": user.user_role
    }

    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLoginRequest):

    db_user = users_db.get(user.email)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(
        user.password,
        db_user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
    {
        "sub": str(user.email),
        "role": db_user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)  # expires in 24 hours
    },
    SECRET_KEY,
    algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }