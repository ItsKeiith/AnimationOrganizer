import React, { useRef, useState, useEffect } from 'react';
import './Pipeline.css';

function Pipeline({ userRole = 'admin', projectName = 'Proyecto X', videoSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [views, setViews] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [viewCounter, setViewCounter] = useState(1);
  const [newViewNameInput, setNewViewNameInput] = useState('');
  const [openDropdownViewId, setOpenDropdownViewId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetViewId, setTargetViewId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    task_name: '',
    task_description: '',
    is_estatic: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const viewsRes = await fetch('http://localhost:8000/views');
        if (viewsRes.ok) {
          const viewsResult = await viewsRes.json();
          const sortedViews = viewsResult.data.sort((a, b) => a.views_order - b.views_order);
          setViews(sortedViews);
          setViewCounter(sortedViews.length + 1);
        }

        const tasksRes = await fetch('http://localhost:8000/tasks');
        if (tasksRes.ok) {
          const tasksResult = await tasksRes.json();
          setTasks(tasksResult.data);
        }
      } catch (error) {
        console.error("Error de red al conectar con el backend:", error);
      }
    };
    fetchData();
  }, []);

  //  CRUD DE LAS VIEWS 
  const handleCreateView = async () => {
    const finalViewName = newViewNameInput.trim() !== '' ? newViewNameInput : `view_${viewCounter}`;
    const nextOrder = views.length + 1;

    const newViewData = {
      views_pk: Math.floor(Math.random() * 1000000),
      views_name: finalViewName,
      views_order: nextOrder,
      is_active: true,
      groups_tasks_views_pk: 1
    };

    try {
      const response = await fetch('http://localhost:8000/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newViewData),
      });

      if (response.ok) {
        setViews([...views, newViewData]);
        setViewCounter(viewCounter + 1);
        setNewViewNameInput('');
      } else {
        const errorData = await response.json();
        alert(`Error al crear vista: ${JSON.stringify(errorData.detail || errorData)}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleUpdateView = async (viewId, currentOrder) => {
    const updatedName = prompt("Escribe el nuevo nombre para esta vista:");
    if (!updatedName) return;

    const updatedViewData = {
      views_pk: viewId,
      views_name: updatedName,
      views_order: currentOrder,
      is_active: true,
      groups_tasks_views_pk: 1
    };

    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedViewData),
      });

      if (response.ok) {
        setViews(views.map(v => v.views_pk === viewId ? { ...v, views_name: updatedName } : v));
      }
    } catch (error) {
      console.error('Error al actualizar la vista:', error);
    }
  };

  const handleDeleteView = async (viewId) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta vista?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setViews(views.filter(v => v.views_pk !== viewId));
      }
    } catch (error) {
      console.error('Error al eliminar la vista:', error);
    }
  };

  const moveViewOrder = async (index, direction) => {
    if (index + direction < 0 || index + direction >= views.length) return;

    const newViews = [...views];
    const viewA = { ...newViews[index] };
    const viewB = { ...newViews[index + direction] };

    const tempOrder = viewA.views_order;
    viewA.views_order = viewB.views_order;
    viewB.views_order = tempOrder;

    newViews[index] = viewB;
    newViews[index + direction] = viewA;
    setViews(newViews);

    try {
      await fetch(`http://localhost:8000/views/${viewA.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewA) });
      await fetch(`http://localhost:8000/views/${viewB.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewB) });
    } catch (error) {
      console.error("Error sincronizando el nuevo orden en el back:", error);
    }
  };

  //  CRUD DE LAS TASKS 

  const toggleTaskDropdown = (viewId) => {
    setOpenDropdownViewId(openDropdownViewId === viewId ? null : viewId);
  };

  const openTaskModal = (viewId) => {
    setTargetViewId(viewId);
    setTaskForm({ task_name: '', task_description: '', is_estatic: false });
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setTargetViewId(null);
  };

  const handleCreateTask = async () => {
    if (!taskForm.task_name.trim()) {
      alert("El nombre de la tarea es obligatorio.");
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const newTaskData = {
      tasks_pk: Math.floor(Math.random() * 1000000),
      task_name: taskForm.task_name,
      task_description: taskForm.task_description || "Sin descripción",
      task_status: "Pendiente",
      task_created_at: todayDate,
      task_updated_at: todayDate,
      tasks_order: tasks.length + 1,
      tasks_duration: "0h",
      is_estatic: taskForm.is_estatic,
      is_active: true,
      groups_tasks_pk: targetViewId
    };

    try {
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData),
      });

      if (response.ok) {
        console.log('Tarea creada en BD');
        setTasks([...tasks, newTaskData]);
        closeTaskModal();
      } else {
        const errorData = await response.json();
        alert(`Error al crear tarea: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  const handleUpdateTask = async (taskToUpdate) => {
    const updatedName = prompt("Escribe el nuevo nombre para la tarea:", taskToUpdate.task_name);
    if (!updatedName) return;

    const todayDate = new Date().toISOString().split('T')[0];

    const updatedTaskData = {
      ...taskToUpdate,
      task_name: updatedName,
      task_updated_at: todayDate
    };

    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskToUpdate.tasks_pk}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTaskData),
      });

      if (response.ok) {
        console.log('Tarea actualizada');
        setTasks(tasks.map(t => t.tasks_pk === taskToUpdate.tasks_pk ? updatedTaskData : t));
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta tarea?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('Tarea eliminada');
        setTasks(tasks.filter(t => t.tasks_pk !== taskId));
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  // controles de video *Cambiar al rato
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };
  const handleFastForward = () => { if (videoRef.current) videoRef.current.currentTime += 5; };
  const handleRewind = () => { if (videoRef.current) videoRef.current.currentTime -= 5; };
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    if (duration) setProgress((videoRef.current.currentTime / duration) * 100);
  };
  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = (e.target.value / 100) * videoRef.current.duration;
    setProgress(e.target.value);
  };

  return (
    <div className="pipeline-container">

      {/*Dialog crear tasks  */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#2c303a', padding: '25px', borderRadius: '8px',
            width: '400px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
              Crear Nueva Tarea
            </h3>

            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de la tarea:</label>
            <input
              type="text"
              value={taskForm.task_name}
              onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }}
            />

            <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
            <textarea
              value={taskForm.task_description}
              onChange={(e) => setTaskForm({ ...taskForm, task_description: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white', minHeight: '80px' }}
            />

            <label style={{ display: 'block', marginBottom: '5px' }}>¿Es estático?</label>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="is_estatic"
                  checked={taskForm.is_estatic === true}
                  onChange={() => setTaskForm({ ...taskForm, is_estatic: true })}
                  style={{ marginRight: '5px' }}
                />
                Sí
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="is_estatic"
                  checked={taskForm.is_estatic === false}
                  onChange={() => setTaskForm({ ...taskForm, is_estatic: false })}
                  style={{ marginRight: '5px' }}
                />
                No
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={closeTaskModal}
                style={{ padding: '8px 15px', background: '#555', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                style={{ padding: '8px 15px', background: '#4a90e2', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Guardar Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="project-header">
        <h2>{projectName}</h2>
      </div>

      <div className="video-container">
        <div className="video-screen">
          {videoSrc ? (
            <video ref={videoRef} src={videoSrc} className="video-element" onTimeUpdate={handleTimeUpdate} onClick={togglePlay} />
          ) : (<div className="no-content-message">Aun no hay contenido</div>)}
        </div>

        <div className="video-controls-centered">
          <button onClick={handleRewind} className="control-btn" title="Atrasar 5s">◀◀</button>
          <button onClick={togglePlay} className="control-btn play-main-btn">
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={handleFastForward} className="control-btn" title="Adelantar 5s">▶▶</button>
        </div>

        <div className="video-controls-bar">
          <div className="progress-bar-container">
            <input type="range" min="0" max="100" value={progress || 0} onChange={handleProgressChange} className="progress-bar" />
          </div>
        </div>
      </div>

      {/* CRUD de Views en Frnt */}
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
                    <div className="task-dropdown-menu-container">
                      <button className="create-task-btn" onClick={() => openTaskModal(view.views_pk)}>
                        ➕ Crear Nueva Tarea
                      </button>

                      {/* --- Lista de tasks hayq eu checar para tener una barra para desplazarse por las tareas al rato lo hago --- */}
                      <div
                        className="tasks-list"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginTop: '15px'
                        }}
                      >
                        {tasks.filter(t => t.groups_tasks_pk === view.views_pk && t.is_active !== false).length === 0 ? (
                          <p className="empty-tasks-text" style={{ width: '100%' }}>No hay tareas en esta vista</p>
                        ) : (
                          tasks
                            .filter(t => t.groups_tasks_pk === view.views_pk && t.is_active !== false)
                            .map(task => (
                              <div
                                key={task.tasks_pk}
                                className="task-item"
                                style={{
                                  flex: '1 1 200px',
                                  maxWidth: '300px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '10px',
                                  background: '#1e2128',
                                  border: '1px solid #333',
                                  borderRadius: '6px'
                                }}
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
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Pipeline;