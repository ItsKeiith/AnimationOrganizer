from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date

from model.user import User
from model.rol import Role
from model.tasks import Tasks
from model.files_tasks import FilesTasks
from model.files_tasks_groups import FilesTasksGroups
from model.files_tasks_type import FilesTasksTypes
from model.groups_tasks_views import GroupsTasksViews
from model.groups_tasks import GroupTasks
from model.permisions import Permissions
from model.permissions_group import PermissionsGroup
from model.views import Views   

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class ViewsClass(BaseModel):
    views_pk: int
    views_name: str
    views_order: int   # <-- ATRIBUTO AGREGADO AQUÍ
    is_active: bool
    groups_tasks_views_pk: int
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/views")
async def obtener_views(db: Session = Depends(get_db)):
    # Los ordenamos por la columna views_order por defecto
    views = db.query(Views).order_by(Views.views_order).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(views),
        "data": views
    }

# POST
@router.post("/views")
def create_view(
    view_data: ViewsClass,
    db: Session = Depends(get_db)
):
    existing_view = db.query(Views).filter(
        Views.views_name == view_data.views_name
    ).first()

    if existing_view:
        raise HTTPException(
            status_code=400,
            detail="View name already exists"
        )

    new_view = Views(
        views_pk=view_data.views_pk,
        views_name=view_data.views_name,
        views_order=view_data.views_order, # <-- ATRIBUTO AGREGADO AQUÍ
        is_active=view_data.is_active,
        groups_tasks_views_pk=view_data.groups_tasks_views_pk
    )

    db.add(new_view)
    db.commit()
    db.refresh(new_view)

    return {
        "message": "View created successfully",
        "data": new_view
    }

# POST BULK
@router.post("/views/bulk")
def create_views_bulk(
    views_list: List[ViewsClass],
    db: Session = Depends(get_db)
):
    views_to_insert = [
        Views(
            views_pk=item.views_pk,
            views_name=item.views_name,
            views_order=item.views_order, # <-- ATRIBUTO AGREGADO AQUÍ
            is_active=item.is_active,
            groups_tasks_views_pk=item.groups_tasks_views_pk
        )
        for item in views_list
    ]

    db.add_all(views_to_insert)
    db.commit()

    return {
        "message": f"{len(views_to_insert)} views inserted"
    }

# PUT
@router.put("/views/{view_id}")
def update_view(
    view_id: int,
    view_data: ViewsClass,
    db: Session = Depends(get_db)
):
    view_actual = db.query(Views).filter(
        Views.views_pk == view_id
    ).first()

    if not view_actual:
        raise HTTPException(
            status_code=404,
            detail="View not found"
        )

    view_actual.views_name = view_data.views_name
    view_actual.views_order = view_data.views_order # <-- ATRIBUTO AGREGADO AQUÍ
    view_actual.is_active = view_data.is_active
    view_actual.groups_tasks_views_pk = view_data.groups_tasks_views_pk

    db.commit()
    db.refresh(view_actual)

    return {
        "message": "View updated",
        "data": view_actual
    }

# DELETE
@router.delete("/views/{views_pk}")
async def borrar_view(views_pk: int, db: Session = Depends(get_db)):
    view_actual = db.query(Views).filter(
        Views.views_pk == views_pk
    ).first() 

    if not view_actual:
        raise HTTPException(status_code=404, detail="View no encontrado")

    view_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"View con ID {views_pk} desactivado correctamente"}