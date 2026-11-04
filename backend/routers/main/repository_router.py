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
from model.project import Project
from model.repository import Repository

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class RepositoryClass(BaseModel):
    repository_pk: int
    tasks_fk: int
    link: str
    repository_description: str
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
@router.get("/repositories")
async def obtener_repositories(db: Session = Depends(get_db)):
    repositories = db.query(Repository).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(repositories),
        "data": repositories
    }

# POST
@router.post("/repositories")
def create_repository(
    repository_data: RepositoryClass,
    db: Session = Depends(get_db)
):
    existing_repository = db.query(Repository).filter(
        Repository.link == repository_data.link
    ).first()

    if existing_repository:
        raise HTTPException(
            status_code=400,
            detail="Repository link already exists"
        )

    new_repository = Repository(
        repository_pk=repository_data.repository_pk,
        tasks_fk=repository_data.tasks_fk,
        link=repository_data.link,
        repository_description=repository_data.repository_description,
        is_active=repository_data.is_active
    )

    db.add(new_repository)
    db.commit()
    db.refresh(new_repository)

    return {
        "message": "Repository created successfully",
        "data": new_repository
    }

# POST BULK
@router.post("/repositories/bulk")
def create_repositories_bulk(
    repositories_list: List[RepositoryClass],
    db: Session = Depends(get_db)
):
    repositories_to_insert = [
        Repository(
            repository_pk=item.repository_pk,
            tasks_fk=item.tasks_fk,
            link=item.link,
            repository_description=item.repository_description,
            is_active=item.is_active
        )
        for item in repositories_list
    ]

    db.add_all(repositories_to_insert)
    db.commit()

    return {
        "message": f"{len(repositories_to_insert)} repositories inserted"
    }

# PUT
@router.put("/repositories/{repository_id}")
def update_repository(
    repository_id: int,
    repository_data: RepositoryClass,
    db: Session = Depends(get_db)
):
    repository_actual = db.query(Repository).filter(
        Repository.repository_pk == repository_id
    ).first()

    if not repository_actual:
        raise HTTPException(
            status_code=404,
            detail="Repository not found"
        )

    repository_actual.tasks_fk = repository_data.tasks_fk
    repository_actual.link = repository_data.link
    repository_actual.repository_description = repository_data.repository_description
    repository_actual.is_active = repository_data.is_active

    db.commit()
    db.refresh(repository_actual)

    return {
        "message": "Repository updated",
        "data": repository_actual
    }

# DELETE
@router.delete("/repositories/{repository_pk}")
async def borrar_repository(repository_pk: int, db: Session = Depends(get_db)):
    repository_actual = db.query(Repository).filter(
        Repository.repository_pk == repository_pk
    ).first() 

    if not repository_actual:
        raise HTTPException(status_code=404, detail="Repository no encontrado")

    repository_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Repository con ID {repository_pk} desactivado correctamente"}