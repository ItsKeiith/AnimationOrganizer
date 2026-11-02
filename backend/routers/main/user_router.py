from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date

from model.user import User
from model.rol import Role

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

# Clase base para manejar la base de datos (Sin modificaciones)
class UsersClass(BaseModel):
    users_pk: int
    user_name: str
    user_email: str
    user_password: str
    user_status: str
    user_created_at: date
    user_updated_at: date
    is_active: bool
    role_pk: int                                                                                                                                   

# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Endpoints
# GET
@router.get("/users")
async def obtener_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    
    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(users),
        "data": users
    }

# POST
@router.post("/users")
def create_user(
    user_data: UsersClass,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.user_email == user_data.user_email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        users_pk=user_data.users_pk,
        user_name=user_data.user_name,
        user_password=user_data.user_password,
        user_email=user_data.user_email,
        user_status=user_data.user_status,
        user_created_at=user_data.user_created_at,
        user_updated_at=user_data.user_updated_at,
        is_active=user_data.is_active,
        role_pk=user_data.role_pk
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "data": new_user
    }


# POST BULK
@router.post("/users/bulk")
def create_users_bulk(
    users: List[UsersClass],
    db: Session = Depends(get_db)
):
    users_to_insert = [
        User(
            users_pk=user.users_pk,
            user_name=user.user_name,
            user_password=user.user_password,
            user_email=user.user_email,
            user_status=user.user_status,
            user_created_at=user.user_created_at,
            user_updated_at=user.user_updated_at,
            is_active=user.is_active,
            role_pk=user.role_pk
        )
        for user in users
    ]

    db.add_all(users_to_insert)
    db.commit()

    return {
        "message": f"{len(users_to_insert)} users inserted"
    }

# PUT
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: UsersClass,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.users_pk == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.user_name = user_data.user_name
    user.user_email = user_data.user_email
    user.user_password = user_data.user_password
    user.user_status = user_data.user_status
    user.user_updated_at = user_data.user_updated_at
    user.is_active = user_data.is_active
    user.role_pk = user_data.role_pk

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated",
        "data": user
    }

# DELETE
@router.delete("/users/{users_pk}")
async def borrar_user(users_pk: int, db: Session = Depends(get_db)):
    user_actual = db.query(User).filter(User.users_pk == users_pk).first() 

    if not user_actual:
        raise HTTPException(status_code=404, detail="User no encontrado")

    user_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"User con ID {users_pk} desactivado correctamente"}