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
class RolesClass(BaseModel):
    role_pk: int
    role_name: str
    role_description: str
    is_active: bool
    
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
    roles = db.query(Role).all()
    
    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(roles),
        "data": roles
    }

# POST
@router.post("/users")
def create_user(
    user_data: RolesClass,
    db: Session = Depends(get_db)
):
    existing_role = db.query(Role).filter(
        Role.role_name == user_data.role_name
    ).first()

    if existing_role:
        raise HTTPException(
            status_code=400,
            detail="Role name already exists"
        )

    new_role = Role(
        role_pk=user_data.role_pk,
        role_name=user_data.role_name,
        role_description=user_data.role_description,
        is_active=user_data.is_active
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return {
        "message": "Role created successfully",
        "data": new_role
    }


# POST BULK
@router.post("/users/bulk")
def create_users_bulk(
    users: List[RolesClass],
    db: Session = Depends(get_db)
):
    roles_to_insert = [
        Role(
            role_pk=user.role_pk,
            role_name=user.role_name,
            role_description=user.role_description,
            is_active=user.is_active
        )
        for user in users
    ]

    db.add_all(roles_to_insert)
    db.commit()

    return {
        "message": f"{len(roles_to_insert)} roles inserted"
    }

# PUT
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: RolesClass,
    db: Session = Depends(get_db)
):
    role_actual = db.query(Role).filter(
        Role.role_pk == user_id
    ).first()

    if not role_actual:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    role_actual.role_name = user_data.role_name
    role_actual.role_description = user_data.role_description
    role_actual.is_active = user_data.is_active

    db.commit()
    db.refresh(role_actual)

    return {
        "message": "Role updated",
        "data": role_actual
    }

# DELETE
@router.delete("/users/{users_pk}")
async def borrar_user(users_pk: int, db: Session = Depends(get_db)):
    role_actual = db.query(Role).filter(Role.role_pk == users_pk).first() 

    if not role_actual:
        raise HTTPException(status_code=404, detail="Role no encontrado")

    db.delete(role_actual)
    db.commit()
    
    return {"mensaje": f"Role con ID {users_pk} borrado correctamente"}



