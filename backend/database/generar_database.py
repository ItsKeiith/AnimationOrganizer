from fastapi import FastAPI
from database.database import engine, Base

from model.user import User
from model.rol import Role
from model.groups_tasks import GroupTasks
from model.tasks import Tasks
from model.groups_tasks_views import GroupsTasksViews
from model.views import Views
from model.permisions import Permissions
from model.permissions_group import PermissionsGroup
from model.files_tasks_type import FilesTasksTypes
from model.files_tasks_groups import FilesTasksGroups
from model.files_tasks import FilesTasks


Base.metadata.create_all(bind=engine)




