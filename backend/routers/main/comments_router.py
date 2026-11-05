
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
from model.comments import Comments

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class CommentsClass(BaseModel):
    comments_pk: int
    comments_description: str
    comments_date: date
    created_by: str
    task_pk: int
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
@router.get("/comments")
async def obtener_comments(db: Session = Depends(get_db)):
    comments = db.query(Comments).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(comments),
        "data": comments
    }

# POST
@router.post("/comments")
def create_comment(
    comment_data: CommentsClass,
    db: Session = Depends(get_db)
):
    existing_comment = db.query(Comments).filter(
        Comments.comments_pk == comment_data.comments_pk
    ).first()

    if existing_comment:
        raise HTTPException(
            status_code=400,
            detail="Comment ID already exists"
        )

    new_comment = Comments(
        comments_pk=comment_data.comments_pk,
        comments_description=comment_data.comments_description,
        comments_date=comment_data.comments_date,
        created_by=comment_data.created_by,
        task_pk=comment_data.task_pk,
        is_active=comment_data.is_active
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "message": "Comment created successfully",
        "data": new_comment
    }

# POST BULK
@router.post("/comments/bulk")
def create_comments_bulk(
    comments_list: List[CommentsClass],
    db: Session = Depends(get_db)
):
    comments_to_insert = [
        Comments(
            comments_pk=item.comments_pk,
            comments_description=item.comments_description,
            comments_date=item.comments_date,
            created_by=item.created_by,
            task_pk=item.task_pk,
            is_active=item.is_active
        )
        for item in comments_list
    ]

    db.add_all(comments_to_insert)
    db.commit()

    return {
        "message": f"{len(comments_to_insert)} comments inserted"
    }

# PUT
@router.put("/comments/{comment_id}")
def update_comment(
    comment_id: int,
    comment_data: CommentsClass,
    db: Session = Depends(get_db)
):
    comment_actual = db.query(Comments).filter(
        Comments.comments_pk == comment_id
    ).first()

    if not comment_actual:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )

    comment_actual.comments_description = comment_data.comments_description
    comment_actual.comments_date = comment_data.comments_date
    comment_actual.created_by = comment_data.created_by
    comment_actual.task_pk = comment_data.task_pk
    comment_actual.is_active = comment_data.is_active

    db.commit()
    db.refresh(comment_actual)

    return {
        "message": "Comment updated",
        "data": comment_actual
    }

# DELETE
@router.delete("/comments/{comments_pk}")
async def borrar_comment(comments_pk: int, db: Session = Depends(get_db)):
    comment_actual = db.query(Comments).filter(
        Comments.comments_pk == comments_pk
    ).first() 

    if not comment_actual:
        raise HTTPException(status_code=404, detail="Comment no encontrado")

    comment_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Comment con ID {comments_pk} desactivado correctamente"}
