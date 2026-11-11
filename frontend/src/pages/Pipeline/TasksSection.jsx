import React from 'react';

function TasksSection({
  viewId,
  tasks,
  openTaskModal,
  openEditTaskModal,
  handleToggleLock,
  handleDeleteTask
}) {
  const viewTasks = tasks.filter(t => t.views_pk === viewId && t.is_active !== false);

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
              <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: '8px' }}>
                {/* Botón interactivo del Candado */}
                <span
                  onClick={() => handleToggleLock(task)}
                  style={{ cursor: 'pointer', fontSize: '16px' }}
                  title={task.is_estatic ? "Desbloquear Tarea" : "Bloquear Tarea"}
                >
                  {task.is_estatic ? '🔒' : '🔓'}
                </span>
                <span className="task-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.task_name}
                </span>
              </div>

              <div className="task-actions" style={{ display: 'flex', gap: '5px' }}>
                <button title="Actualizar" onClick={() => openEditTaskModal(task)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a90e2', fontWeight: 'bold' }}>PUT</button>
                <button title="Borrar" onClick={() => handleDeleteTask(task.tasks_pk)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}>DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksSection;