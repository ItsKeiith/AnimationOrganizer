import React, { useRef, useState, useEffect } from 'react';
import ViewsSection from './ViewsSection';
import './Pipeline.css';

const parseDuration = (durStr) => {
  if (!durStr) return 60;
  const parts = durStr.split(':');
  if (parts.length === 3) return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  return 60;
};

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

function Pipeline({ userRole = 'admin', projectName = 'Proyecto X', videoSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(300);

  const [views, setViews] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [viewCounter, setViewCounter] = useState(1);
  const [newViewNameInput, setNewViewNameInput] = useState('');
  const [openDropdownViewId, setOpenDropdownViewId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetViewId, setTargetViewId] = useState(null);
  const [taskForm, setTaskForm] = useState({ task_name: '', task_description: '', is_estatic: false });

  const [activeTimelineViewId, setActiveTimelineViewId] = useState(null);
  const dragRef = useRef({ isDragging: false, taskId: null, startX: 0, startDur: 0, taskRef: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const viewsRes = await fetch('http://localhost:8000/views');
        if (viewsRes.ok) {
          const viewsResult = await viewsRes.json();
          const sortedViews = (viewsResult.data || viewsResult).sort((a, b) => a.views_order - b.views_order);
          setViews(sortedViews);
          setViewCounter(sortedViews.length + 1);
        }

        const tasksRes = await fetch('http://localhost:8000/tasks');
        if (tasksRes.ok) {
          const tasksResult = await tasksRes.json();
          setTasks(tasksResult.data || tasksResult);
        }
      } catch (error) { console.error("Error de red:", error); }
    };
    fetchData();
  }, []);

  const handleDragStart = (e, task) => {
    e.preventDefault();
    const timelineContainer = document.querySelector('.timeline-task-tracks');
    const timelineWidth = timelineContainer ? timelineContainer.clientWidth : 800;

    dragRef.current = { isDragging: true, taskId: task.tasks_pk, startX: e.clientX, startDur: parseDuration(task.tasks_duration), timelineWidth, taskRef: task };

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.isDragging) return;
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaSecs = (deltaX / dragRef.current.timelineWidth) * videoDuration;
      let newDur = Math.max(2, dragRef.current.startDur + deltaSecs);
      setTasks(prev => prev.map(t => t.tasks_pk === dragRef.current.taskId ? { ...t, tasks_duration: formatDuration(newDur) } : t));
    };

    const handleMouseUp = async (upEvent) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const deltaX = upEvent.clientX - dragRef.current.startX;
      const deltaSecs = (deltaX / dragRef.current.timelineWidth) * videoDuration;
      let finalDur = Math.max(2, dragRef.current.startDur + deltaSecs);

      const updatedTask = {
        ...dragRef.current.taskRef,
        tasks_duration: formatDuration(finalDur),
        task_updated_at: new Date().toISOString().split('T')[0]
      };

      try {
        await fetch(`http://localhost:8000/tasks/${dragRef.current.taskId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedTask)
        });
      } catch (error) { console.error('Error guardando duración:', error); }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleCreateView = async () => {
    const finalViewName = newViewNameInput.trim() !== '' ? newViewNameInput : `view_${viewCounter}`;

    // YA NO MANDAMOS views_pk
    const newViewData = {
      views_name: finalViewName,
      views_order: views.length + 1,
      is_active: true
    };

    try {
      const response = await fetch('http://localhost:8000/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newViewData)
      });

      if (response.ok) {
        // Leemos lo que nos devolvió el backend (ya trae el ID real)
        const result = await response.json();
        const createdView = result.data || result;

        // Metemos la vista REAL a nuestro estado
        setViews([...views, createdView]);
        setViewCounter(viewCounter + 1);
        setNewViewNameInput('');
      } else {
        const error = await response.json();
        console.error("Error del backend:", error);
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleUpdateView = async (viewId, currentOrder) => {
    const updatedName = prompt("Escribe el nuevo nombre para esta vista:");
    if (!updatedName) return;
    // Removed groups_tasks_views_pk
    const updatedViewData = {
      views_pk: viewId,
      views_name: updatedName,
      views_order: currentOrder,
      is_active: true
    };
    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedViewData) });
      if (response.ok) setViews(views.map(v => v.views_pk === viewId ? { ...v, views_name: updatedName } : v));
    } catch (error) { console.error('Error:', error); }
  };

  const handleDeleteView = async (viewId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta vista?")) return;
    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, { method: 'DELETE' });
      if (response.ok) setViews(views.filter(v => v.views_pk !== viewId));
    } catch (error) { console.error('Error:', error); }
  };

  const moveViewOrder = async (index, direction) => {
    if (index + direction < 0 || index + direction >= views.length) return;
    const newViews = [...views];
    const viewA = { ...newViews[index] }, viewB = { ...newViews[index + direction] };
    viewA.views_order = viewB.views_order; viewB.views_order = newViews[index].views_order;
    newViews[index] = viewB; newViews[index + direction] = viewA;
    setViews(newViews);
    try {
      await fetch(`http://localhost:8000/views/${viewA.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewA) });
      await fetch(`http://localhost:8000/views/${viewB.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewB) });
    } catch (error) { console.error("Error:", error); }
  };

  const toggleTaskDropdown = (viewId) => setOpenDropdownViewId(openDropdownViewId === viewId ? null : viewId);

  const openTaskModal = (viewId) => { setTargetViewId(viewId); setTaskForm({ task_name: '', task_description: '', is_estatic: false }); setIsModalOpen(true); };
  const closeTaskModal = () => { setIsModalOpen(false); setTargetViewId(null); };

  // =====================================================================
  // AQUÍ ESTÁ LA LÓGICA DE DOBLE POST: CREAR TASK -> CREAR RELACIÓN
  // =====================================================================
  const handleCreateTask = async () => {
    if (!taskForm.task_name.trim()) return alert("El nombre es obligatorio.");
    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Preparamos la data de la Task (ya no lleva relación aquí)
    const newTaskData = {
      tasks_pk: Math.floor(Math.random() * 1000000), // Si tu DB es autoincremental, el back lo reescribirá
      task_name: taskForm.task_name,
      task_description: taskForm.task_description || "Sin descripción",
      task_status: "Pendiente",
      task_created_at: todayDate,
      task_updated_at: todayDate,
      tasks_order: tasks.filter(t => t.views_pk === targetViewId).length + 1, // Ahora usamos views_pk
      tasks_duration: taskForm.is_estatic ? "00:00:10" : "00:01:00",
      is_estatic: taskForm.is_estatic,
      is_active: true
    };

    try {
      // POST 1: Crear la tarea
      const responseTask = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      });

      if (responseTask.ok) {
        const resultTask = await responseTask.json();
        const createdTask = resultTask.data || newTaskData;

        // 2. Preparamos la data para la tabla intermedia (GroupsTasksViews)
        const newRelationData = {
          groups_tasks_views_pk: Math.floor(Math.random() * 1000000),
          groups_tasks_views_name: `${createdTask.task_name}_view_${targetViewId}`,
          is_active: true,
          task_pk: createdTask.tasks_pk, // PK de la tarea recién creada
          views_pk: targetViewId         // PK de la vista actual
        };

        // POST 2: Crear el enlace en la tabla intermedia
        // *NOTA: Asegúrate de tener este endpoint en FastAPI (ej. @router.post("/groups_tasks_views"))
        const responseRelation = await fetch('http://localhost:8000/groups_tasks_views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRelationData)
        });

        if (responseRelation.ok) {
          // Si todo sale bien, la inyectamos a React, agregándole views_pk para que el filtro la muestre de inmediato
          setTasks([...tasks, { ...createdTask, views_pk: targetViewId }]);
          closeTaskModal();
        } else {
          alert("La tarea se creó, pero falló al enlazarla con la vista.");
        }
      } else {
        const err = await responseTask.json();
        alert(`Error al crear tarea: ${err.detail || 'Verifica el backend'}`);
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleUpdateTask = async (taskToUpdate) => {
    const updatedName = prompt("Escribe el nuevo nombre:", taskToUpdate.task_name);
    if (!updatedName) return;
    const updatedTaskData = { ...taskToUpdate, task_name: updatedName, task_updated_at: new Date().toISOString().split('T')[0] };
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskToUpdate.tasks_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedTaskData) });
      if (response.ok) setTasks(tasks.map(t => t.tasks_pk === taskToUpdate.tasks_pk ? updatedTaskData : t));
    } catch (error) { console.error('Error:', error); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) setTasks(tasks.filter(t => t.tasks_pk !== taskId));
    } catch (error) { console.error('Error:', error); }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };
  const handleFastForward = () => { if (videoRef.current) videoRef.current.currentTime += 5; };
  const handleRewind = () => { if (videoRef.current) videoRef.current.currentTime -= 5; };
  const handleTimeUpdate = () => { if (videoRef.current && videoRef.current.duration) setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100); };
  const handleProgressChange = (e) => { if (!videoRef.current) return; videoRef.current.currentTime = (e.target.value / 100) * videoRef.current.duration; setProgress(e.target.value); };

  return (
    <div className="pipeline-container">
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#2c303a', padding: '25px', borderRadius: '8px', width: '400px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Crear Nueva Tarea</h3>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de la tarea:</label>
            <input type="text" value={taskForm.task_name} onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }} />
            <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
            <textarea value={taskForm.task_description} onChange={(e) => setTaskForm({ ...taskForm, task_description: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white', minHeight: '80px' }} />
            <label style={{ display: 'block', marginBottom: '5px' }}>¿Es estático?</label>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
              <label style={{ cursor: 'pointer' }}><input type="radio" checked={taskForm.is_estatic === true} onChange={() => setTaskForm({ ...taskForm, is_estatic: true })} style={{ marginRight: '5px' }} /> Sí</label>
              <label style={{ cursor: 'pointer' }}><input type="radio" checked={taskForm.is_estatic === false} onChange={() => setTaskForm({ ...taskForm, is_estatic: false })} style={{ marginRight: '5px' }} /> No</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={closeTaskModal} style={{ padding: '8px 15px', background: '#555', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleCreateTask} style={{ padding: '8px 15px', background: '#4a90e2', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Tarea</button>
            </div>
          </div>
        </div>
      )}

      <div className="project-header"><h2>{projectName}</h2></div>

      <div className="video-container">
        <div className="video-screen">
          {videoSrc ? (
            <video ref={videoRef} src={videoSrc} className="video-element" onTimeUpdate={handleTimeUpdate} onClick={togglePlay} onLoadedMetadata={(e) => setVideoDuration(e.target.duration)} />
          ) : (<div className="no-content-message">Aun no hay contenido</div>)}
        </div>
        <div className="video-controls-centered">
          <button onClick={handleRewind} className="control-btn">◀◀</button>
          <button onClick={togglePlay} className="control-btn play-main-btn">{isPlaying ? '⏸ Pause' : '▶ Play'}</button>
          <button onClick={handleFastForward} className="control-btn">▶▶</button>
        </div>

        <div className="timeline-task-tracks" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '25px', backgroundColor: '#111', marginBottom: '5px', overflowX: 'auto', position: 'relative' }}>
          {activeTimelineViewId ? (
            tasks.filter(t => t.views_pk === activeTimelineViewId && t.is_active !== false)
              .sort((a, b) => a.tasks_order - b.tasks_order)
              .map(task => {
                const durationInSecs = parseDuration(task.tasks_duration);
                return (
                  <div key={task.tasks_pk} title={`${task.task_name} (${task.tasks_duration})`}
                    style={{
                      width: `${(durationInSecs / videoDuration) * 100}%`, minWidth: '20px', height: '100%', backgroundColor: task.is_estatic ? '#888' : '#2196F3',
                      borderRight: '1px solid #000', borderLeft: '1px solid #000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', userSelect: 'none'
                    }}>
                    {task.task_name}
                    {!task.is_estatic && <div onMouseDown={(e) => handleDragStart(e, task)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '6px', backgroundColor: 'rgba(255, 255, 255, 0.4)', cursor: 'ew-resize' }} />}
                  </div>
                );
              })
          ) : (<div style={{ color: '#555', fontSize: '12px', width: '100%', textAlign: 'center', lineHeight: '25px' }}>Selecciona una vista para ver su pipeline</div>)}
        </div>
        <div className="video-controls-bar"><div className="progress-bar-container"><input type="range" min="0" max="100" value={progress || 0} onChange={handleProgressChange} className="progress-bar" /></div></div>
      </div>

      <ViewsSection
        views={views}
        viewCounter={viewCounter}
        newViewNameInput={newViewNameInput}
        setNewViewNameInput={setNewViewNameInput}
        handleCreateView={handleCreateView}
        handleUpdateView={handleUpdateView}
        handleDeleteView={handleDeleteView}
        moveViewOrder={moveViewOrder}
        activeTimelineViewId={activeTimelineViewId}
        setActiveTimelineViewId={setActiveTimelineViewId}
        openDropdownViewId={openDropdownViewId}
        toggleTaskDropdown={toggleTaskDropdown}
        tasks={tasks}
        openTaskModal={openTaskModal}
        handleUpdateTask={handleUpdateTask}
        handleDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

export default Pipeline;