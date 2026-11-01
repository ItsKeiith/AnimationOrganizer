from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone, date
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from model.rol import Roles
from model.user import Users
from database.database import SessionLocal

import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

oauth2 = OAuth2PasswordBearer(tokenUrl="login")
ALGORITMO = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET = os.getenv("SECRET_KEY")

crypt = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    users_pk: int
    user_name: str
    email: str
    creation_date: date
    user_rol_pk: int
    disable: bool = False  

class UserDB(User):
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Buscador de usuario 
def search_user_db(username: str, db: Session):
    user = db.query(Users).filter(Users.user_name == username).first()
    if user:
        return UserDB(
            users_pk=user.users_pk,
            user_name=user.user_name,
            email=user.email,
            creation_date=user.creation_date,
            user_rol_pk=user.user_rol_pk,
            password=user.password, 
            disable=user.disable if hasattr(user, 'disable') else False
        )
    return None
    
@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = search_user_db(form.username, db)
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="No existe usuario"
        )

    if not crypt.verify(form.password, user.password):
        raise HTTPException(
            status_code=400,
            detail="Contraseña incorrecta"
        )

    access_token = {
        "sub": user.user_name, 
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) 
    }

    return {
        "access_token": jwt.encode(access_token, SECRET, algorithm=ALGORITMO),
        "token_type": "bearer",
        "email": user.email,
        "username": user.user_name
    }

async def auth_user(token: str = Depends(oauth2), db: Session = Depends(get_db)):
    exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="No tienes acceso crack", 
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        username = jwt.decode(token, SECRET, algorithms=[ALGORITMO]).get("sub")
        if username is None:
            raise exception
    except InvalidTokenError: 
        raise exception

    user = search_user_db(username, db)
    if user is None:
        raise exception
    return user

async def current_user(user: User = Depends(auth_user)):
    if user.disable:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tas deshabilitado chavo"
        )
    return user

@router.get("/users/me")
async def me(user: User = Depends(current_user)):
    return user

#Checar lo del token para poder hacer uso de la aplicion una vez logeado 