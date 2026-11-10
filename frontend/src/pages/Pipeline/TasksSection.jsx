import React from 'react';

function TasksSection({
  viewId,
  tasks,
  openTaskModal,
  handleUpdateTask,
  handleDeleteTask
}) {
  const viewTasks = tasks.filter(t => t.groups_tasks_pk === viewId && t.is_active !== false);

  return (
    <div className="task-dropdown-menu-container">
      <button className="create-task-btn" onClick={() => openTaskModal(viewId)}>
        ➕ Crear Nueva Tarea
      </button>

      <div
        className="tasks-list"
        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}
      >
        {viewTasks.length === 0 ? (
          <p className="empty-tasks-text" style={{ width: '100%' }}>No hay tareas en esta vista</p>
        ) : (
          viewTasks.map(task => (
            <div
              key={task.tasks_pk}
              className="task-item"
              style={{ flex: '1 1 200px', maxWidth: '300px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1e2128', border: '1px solid #333', borderRadius: '6px' }}
            >
              <span className="task-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.task_name}
              </span>
              <div className="task-actions" style={{ display: 'flex', gap: '5px' }}>
                <button title="Actualizar" onClick={() => handleUpdateTask(task)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>PUT</button>
                <button title="Borrar" onClick={() => handleDeleteTask(task.tasks_pk)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksSection;