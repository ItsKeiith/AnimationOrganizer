import React, { useState } from 'react';

function TasksSection({
  viewId,
  tasks,
  openTaskModal,
  openEditTaskModal,
  handleToggleLock,
  handleDeleteTask,

  // Nuevas props
  handleToggleStatus,
  taskComments,
  fetchTaskComments,
  handleAddComment,
  currentUserRole
}) {
  const viewTasks = tasks.filter(t => t.views_pk === viewId && t.is_active !== false);

  // Estado local para el chat
  const [openChatTaskId, setOpenChatTaskId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const toggleChat = (taskId) => {
    if (openChatTaskId === taskId) {
      setOpenChatTaskId(null); // Cerrar si ya está abierto
    } else {
      setOpenChatTaskId(taskId); // Abrir chat
      fetchTaskComments(taskId); // Cargar mensajes desde backend
    }
  };

  const submitComment = (taskId) => {
    if (!newCommentText.trim()) return;
    handleAddComment(taskId, newCommentText, currentUserRole);
    setNewCommentText('');
  };

  return (
    <div className="task-dropdown-menu-container">
      <button className="create-task-btn" onClick={() => openTaskModal(viewId)}>
        ➕ Crear Nueva Tarea
      </button>

      <div
        className="tasks-list"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}
      >
        {viewTasks.length === 0 ? (
          <p className="empty-tasks-text" style={{ width: '100%' }}>No hay tareas en esta vista</p>
        ) : (
          viewTasks.map(task => (
            <div
              key={task.tasks_pk}
              className="task-item-container"
              style={{ display: 'flex', flexDirection: 'column', background: '#1e2128', border: '1px solid #333', borderRadius: '6px' }}
            >
              {/* HEADER DE LA TAREA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: '8px' }}>
                  <span
                    onClick={() => handleToggleLock(task)}
                    style={{ cursor: 'pointer', fontSize: '16px' }}
                    title={task.is_estatic ? "Desbloquear Tarea" : "Bloquear Tarea"}
                  >
                    {task.is_estatic ? '🔒' : '🔓'}
                  </span>
                  <span className="task-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {task.task_name}
                  </span>
                </div>

                <div className="task-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Boton de Status */}
                  <button
                    title="Cambiar Estatus"
                    onClick={() => handleToggleStatus(task)}
                    style={{
                      background: task.task_status === 'Completada' ? '#27ae60' : '#f39c12',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold', padding: '4px 8px', fontSize: '11px'
                    }}>
                    {task.task_status === 'Completada' ? ' Completada' : 'Pendiente'}
                  </button>

                  {/* Boton de Chat */}
                  <button
                    title="Chat de la Tarea"
                    onClick={() => toggleChat(task.tasks_pk)}
                    style={{ background: '#34495e', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', padding: '4px 8px', fontSize: '11px' }}>
                    CHAT
                  </button>

                  <button title="Actualizar" onClick={() => openEditTaskModal(task)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a90e2', fontWeight: 'bold', fontSize: '12px' }}>PUT</button>
                  <button title="Borrar" onClick={() => handleDeleteTask(task.tasks_pk)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold', fontSize: '12px' }}>DELETE</button>
                </div>
              </div>

              {/* DESPLEGABLE DE CHAT */}
              {openChatTaskId === task.tasks_pk && (
                <div style={{ background: '#16181d', padding: '10px', borderTop: '1px solid #333', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>

                  {/* Lista de Mensajes */}
                  <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(!taskComments[task.tasks_pk] || taskComments[task.tasks_pk].length === 0) ? (
                      <span style={{ color: '#777', fontSize: '12px', fontStyle: 'italic' }}>No hay comentarios aún.</span>
                    ) : (
                      taskComments[task.tasks_pk].map(comment => (
                        <div key={comment.comments_pk} style={{ display: 'flex', flexDirection: 'column', background: comment.created_by === 'admin' ? '#2c3e50' : '#34495e', padding: '6px 10px', borderRadius: '4px', width: 'fit-content', maxWidth: '85%', alignSelf: comment.created_by === currentUserRole ? 'flex-end' : 'flex-start' }}>
                          <span style={{ fontSize: '10px', color: '#bdc3c7', marginBottom: '2px' }}>{comment.created_by}</span>
                          <span style={{ fontSize: '13px', color: 'white' }}>{comment.comments_description}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input de Mensaje Nuevo */}
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="text"
                      placeholder="Escribe un comentario..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment(task.tasks_pk)}
                      style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: 'white', fontSize: '12px' }}
                    />
                    <button
                      onClick={() => submitComment(task.tasks_pk)}
                      style={{ background: '#4a90e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', padding: '6px 12px', fontWeight: 'bold', fontSize: '12px' }}>
                      Enviar
                    </button>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksSection;