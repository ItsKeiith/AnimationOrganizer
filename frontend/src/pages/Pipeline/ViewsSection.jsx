import React from 'react';
import TasksSection from './TasksSection';

function ViewsSection({
  views,
  viewCounter,
  newViewNameInput,
  setNewViewNameInput,
  handleCreateView,
  handleUpdateView,
  handleDeleteView,

  // Recibimos los métodos de Drag and Drop
  onDragStartView,
  onDragOverView,
  onDropView,

  activeTimelineViewId,
  setActiveTimelineViewId,
  openDropdownViewId,
  toggleTaskDropdown,

  // Props que bajan hasta TasksSection
  tasks,
  openTaskModal,
  openEditTaskModal,
  handleToggleLock,
  handleDeleteTask,

  //Comentarios
  handleToggleStatus,
  taskComments,
  fetchTaskComments,
  handleAddComment,
  currentUserRole

}) {
  return (
    <div className="views-section-container">
      <div className="views-header-left">
        <input
          type="text"
          className="view-name-input"
          placeholder={`view_${viewCounter}`}
          value={newViewNameInput}
          onChange={(e) => setNewViewNameInput(e.target.value)}
        />
        <button onClick={handleCreateView} className="add-view-button" title="Agregar vista">+</button>
      </div>

      <div className="views-content-area">
        {views.length === 0 ? (
          <p className="empty-views-text">No hay vistas agregadas todavia</p>
        ) : (
          views.map((view, index) => {
            const isActive = activeTimelineViewId === view.views_pk;

            return (
              <div
                key={view.views_pk}
                className="view-item-card"
                draggable
                onDragStart={(e) => onDragStartView(e, view.views_pk)}
                onDragOver={onDragOverView}
                onDrop={(e) => onDropView(e, view.views_pk)}
                onClick={() => setActiveTimelineViewId(view.views_pk)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#3b4554' : '',
                  borderLeft: isActive ? '4px solid #4a90e2' : '4px solid transparent',
                  transition: 'background-color 0.2s, border-left 0.2s'
                }}
              >

                <div className="view-item-header">
                  <h4>{view.views_name}</h4>

                  <div className="view-actions">
                    <button
                      className="view-action-btn update-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateView(view.views_pk, view.views_order);
                      }}
                    >
                      PUT
                    </button>
                    <button
                      className="view-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteView(view.views_pk);
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                <div className="task-dropdown-container">
                  <button
                    className="task-dropdown-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskDropdown(view.views_pk);
                    }}
                  >
                    Opciones de Tareas {openDropdownViewId === view.views_pk ? '▲' : '▼'}
                  </button>

                  {openDropdownViewId === view.views_pk && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <TasksSection
                        viewId={view.views_pk}
                        tasks={tasks}
                        openTaskModal={openTaskModal}
                        openEditTaskModal={openEditTaskModal}
                        handleToggleLock={handleToggleLock}
                        handleDeleteTask={handleDeleteTask}

                        handleToggleStatus={handleToggleStatus}
                        taskComments={taskComments}
                        fetchTaskComments={fetchTaskComments}
                        handleAddComment={handleAddComment}
                        currentUserRole={currentUserRole}

                      />
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ViewsSection;