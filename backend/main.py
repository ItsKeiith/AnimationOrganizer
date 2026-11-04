#FastApi
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv  
import requests
import os

#Middleware
from fastapi.middleware.cors import CORSMiddleware

#SQL
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine



#Routers
from routers.authentication.jwt_auth_users import router as login_router
from routers.main.user_router import router as users_router
from routers.main.rol_router import router as rol_router
from routers.main.views_router import router as views_router
from routers.main.permisions_router import router as permissions_router
from routers.main.tasks_router import router as tasks_router
from routers.main.permissions_groups_router import router as permissions_group_router
from routers.main.group_tasks_views_router import router as groups_tasks_views_router
from routers.main.group_tasks_router import router as group_tasks_router
from routers.main.files_tasks_type_router import router as files_tasks_type_router
from routers.main.files_tasks_router import router as files_tasks_router
from routers.main.files_tasks_groups_router import router as files_tasks_groups_router

#main
app = FastAPI()

#middleware
#Rutas del frontend que se permiten para hacer peticiones al backend
origins = [
    "http://localhost:3000",
   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],       #Permitir los metodos HTTP si quiero bloquear algun metodo hay que editar aqui
    allow_headers=["*"],       # Permite todos los headers
)

#Invocaione de los Routers
app.include_router(login_router)
app.include_router(users_router)
app.include_router(rol_router)
app.include_router(views_router)
app.include_router(permissions_router)
app.include_router(tasks_router)
app.include_router(permissions_group_router)
app.include_router(groups_tasks_views_router)
app.include_router(group_tasks_router)
app.include_router(files_tasks_type_router)
app.include_router(files_tasks_router)
app.include_router(files_tasks_groups_router)

#Funcion de Sesion de la base de datos 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

