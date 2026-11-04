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

class ProjectClass(BaseModel):
    project_pk: int
    project_name: str
    views_fk: int
    users_fk: int
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
@router.get("/projects")
async def obtener_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(projects),
        "data": projects
    }

# POST
@router.post("/projects")
def create_project(
    project_data: ProjectClass,
    db: Session = Depends(get_db)
):
    existing_project = db.query(Project).filter(
        Project.project_name == project_data.project_name
    ).first()

    if existing_project:
        raise HTTPException(
            status_code=400,
            detail="Project name already exists"
        )

    new_project = Project(
        project_pk=project_data.project_pk,
        project_name=project_data.project_name,
        views_fk=project_data.views_fk,
        users_fk=project_data.users_fk,
        is_active=project_data.is_active
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project created successfully",
        "data": new_project
    }

# POST BULK
@router.post("/projects/bulk")
def create_projects_bulk(
    projects_list: List[ProjectClass],
    db: Session = Depends(get_db)
):
    projects_to_insert = [
        Project(
            project_pk=item.project_pk,
            project_name=item.project_name,
            views_fk=item.views_fk,
            users_fk=item.users_fk,
            is_active=item.is_active
        )
        for item in projects_list
    ]

    db.add_all(projects_to_insert)
    db.commit()

    return {
        "message": f"{len(projects_to_insert)} projects inserted"
    }

# PUT
@router.put("/projects/{project_id}")
def update_project(
    project_id: int,
    project_data: ProjectClass,
    db: Session = Depends(get_db)
):
    project_actual = db.query(Project).filter(
        Project.project_pk == project_id
    ).first()

    if not project_actual:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project_actual.project_name = project_data.project_name
    project_actual.views_fk = project_data.views_fk
    project_actual.users_fk = project_data.users_fk
    project_actual.is_active = project_data.is_active

    db.commit()
    db.refresh(project_actual)

    return {
        "message": "Project updated",
        "data": project_actual
    }

# DELETE
@router.delete("/projects/{project_pk}")
async def borrar_project(project_pk: int, db: Session = Depends(get_db)):
    project_actual = db.query(Project).filter(
        Project.project_pk == project_pk
    ).first() 

    if not project_actual:
        raise HTTPException(status_code=404, detail="Project no encontrado")

    project_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Project con ID {project_pk} desactivado correctamente"}