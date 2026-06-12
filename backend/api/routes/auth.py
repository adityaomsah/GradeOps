# auth.py
# Goal: Handle user registration and login, issue JWT tokens

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
import os

from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import User

router = APIRouter()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM="HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str,hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


class UserRegisterRequest(BaseModel):
    user_email_id: EmailStr
    user_password: str
    user_role: str
    roll_no: Optional[int] = None  # required only when role is "student"

    @field_validator("user_role")
    @classmethod
    def validate_role(cls, value):
        value = value.lower()

        if value not in {"admin","instructor", "ta", "student"}:
            raise ValueError("Invalid role")

        return value

class UserLoginRequest(BaseModel):
    username: EmailStr
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
    

@router.post("/register")
def register(
    user: UserRegisterRequest, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):

    # RBAC
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can register users")
    
    # roll_no required for students
    if user.user_role == "student" and user.roll_no is None:
        raise HTTPException(status_code=400, detail="roll_no is required for student role")

    existing = db.query(User).filter(User.email == user.user_email_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=user.user_email_id,
        password_hash=hash_password(user.user_password),
        role=user.user_role,
        roll_no=user.roll_no
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {
            "sub": str(form_data.username),
            "role": db_user.role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {"access_token": token, "token_type": "bearer"}