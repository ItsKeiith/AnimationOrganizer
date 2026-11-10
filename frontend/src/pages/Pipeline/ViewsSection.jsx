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
  moveViewOrder,
  activeTimelineViewId,
  setActiveTimelineViewId,
  openDropdownViewId,
  toggleTaskDropdown,

  // Props que bajan hasta TasksSection
  tasks,
  openTaskModal,
  handleUpdateTask,
  handleDeleteTask
}) {
  return (
    <div className="views-section-container">
      <div className="views-header-left">
        <h3>Vistas de Produccion</h3>
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
          views.map((view, index) => (
            <div key={view.views_pk} className="view-item-card">

              <div className="view-item-header">
                <h4>{view.views_name}</h4>
                <div className="view-actions">
                  <button
                    onClick={() => setActiveTimelineViewId(view.views_pk)}
                    style={{ background: activeTimelineViewId === view.views_pk ? '#4caf50' : '#4a90e2', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                  >
                    {activeTimelineViewId === view.views_pk ? '✅ Activa' : '🎬 Cargar en Timeline'}
                  </button>

                  <button className="view-action-btn order-btn" onClick={() => moveViewOrder(index, -1)} disabled={index === 0}>UP</button>
                  <button className="view-action-btn order-btn" onClick={() => moveViewOrder(index, 1)} disabled={index === views.length - 1}>DOWN</button>
                  <button className="view-action-btn update-btn" onClick={() => handleUpdateView(view.views_pk, view.views_order)}>PUT</button>
                  <button className="view-action-btn delete-btn" onClick={() => handleDeleteView(view.views_pk)}>DELETE</button>
                </div>
              </div>

              <div className="task-dropdown-container">
                <button className="task-dropdown-btn" onClick={() => toggleTaskDropdown(view.views_pk)}>
                  Opciones de Tareas {openDropdownViewId === view.views_pk ? '▲' : '▼'}
                </button>

                {openDropdownViewId === view.views_pk && (
                  <TasksSection
                    viewId={view.views_pk}
                    tasks={tasks}
                    openTaskModal={openTaskModal}
                    handleUpdateTask={handleUpdateTask}
                    handleDeleteTask={handleDeleteTask}
                  />
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewsSection;