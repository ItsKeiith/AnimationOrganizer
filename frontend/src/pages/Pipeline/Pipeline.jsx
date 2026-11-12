import React, { useRef, useState, useEffect } from 'react';
import ViewsSection from './ViewsSection';
import './Pipeline.css';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

// Utilities
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
  const [timelineScale, setTimelineScale] = useState(1);

  const [views, setViews] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [viewCounter, setViewCounter] = useState(1);
  const [newViewNameInput, setNewViewNameInput] = useState('');
  const [openDropdownViewId, setOpenDropdownViewId] = useState(null);

  const [activeTimelineViewId, setActiveTimelineViewId] = useState(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetViewId, setTargetViewId] = useState(null);
  const [taskForm, setTaskForm] = useState({ task_name: '', task_description: '', task_due_date: '', is_estatic: false });

  const [editTaskForm, setEditTaskForm] = useState(null);

  //DnD
  const dragRef = useRef({ isDragging: false, taskId: null, startX: 0, startDur: 0, taskRef: null });
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedViewId, setDraggedViewId] = useState(null);

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

  // Esta funcion es para el resizing de las tareas en la timeline, no para reordenarlas
  // Se activa al hacer click en el borde derecho de la tarea y arrastrar
  const handleDragStart = (e, task) => {
    e.preventDefault();
    e.stopPropagation();

    const timelineInnerContainer = document.querySelector('.timeline-inner-track');
    const timelineWidth = timelineInnerContainer ? timelineInnerContainer.clientWidth : 800;

    dragRef.current = {
      isDragging: true, taskId: task.tasks_pk, startX: e.clientX,
      startDur: parseDuration(task.tasks_duration), timelineWidth, taskRef: task
    };

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

      const todayDate = new Date().toISOString().split('T')[0];
      const updatedTask = {
        ...dragRef.current.taskRef,
        tasks_duration: formatDuration(finalDur),
        task_created_at: dragRef.current.taskRef.task_created_at || todayDate,
        task_status: dragRef.current.taskRef.task_status || "Pendiente",
        task_due_date: dragRef.current.taskRef.task_due_date || todayDate,
        task_updated_at: todayDate
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

  //Reordenamiento de Tareas
  const onDragStartTask = (e, taskId) => { setDraggedTaskId(taskId); e.dataTransfer.effectAllowed = "move"; };
  const onDragOverTask = (e) => { e.preventDefault(); };
  const onDropTask = async (e, targetTaskId) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const currentTasks = [...tasks];
    const draggedIndex = currentTasks.findIndex(t => t.tasks_pk === draggedTaskId);
    const targetIndex = currentTasks.findIndex(t => t.tasks_pk === targetTaskId);

    // Evitamos intercambiar si alguna está bloqueada
    if (currentTasks[draggedIndex].is_estatic || currentTasks[targetIndex].is_estatic) return;

    const tempOrder = currentTasks[draggedIndex].tasks_order;
    currentTasks[draggedIndex].tasks_order = currentTasks[targetIndex].tasks_order;
    currentTasks[targetIndex].tasks_order = tempOrder;

    setTasks(currentTasks);
    setDraggedTaskId(null);

    const todayDate = new Date().toISOString().split('T')[0];
    const taskA = { ...currentTasks[draggedIndex], task_updated_at: todayDate };
    const taskB = { ...currentTasks[targetIndex], task_updated_at: todayDate };

    try {
      await fetch(`http://localhost:8000/tasks/${taskA.tasks_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskA) });
      await fetch(`http://localhost:8000/tasks/${taskB.tasks_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskB) });
    } catch (error) { console.error("Error updating order:", error); }
  };

  //Reordenamiento de Vistas
  const onDragStartView = (e, viewId) => { setDraggedViewId(viewId); e.dataTransfer.effectAllowed = "move"; };
  const onDragOverView = (e) => { e.preventDefault(); };
  const onDropView = async (e, targetViewId) => {
    e.preventDefault();
    if (!draggedViewId || draggedViewId === targetViewId) return;

    const currentViews = [...views];
    const draggedIndex = currentViews.findIndex(v => v.views_pk === draggedViewId);
    const targetIndex = currentViews.findIndex(v => v.views_pk === targetViewId);

    const tempOrder = currentViews[draggedIndex].views_order;
    currentViews[draggedIndex].views_order = currentViews[targetIndex].views_order;
    currentViews[targetIndex].views_order = tempOrder;

    const sortedViews = [...currentViews].sort((a, b) => a.views_order - b.views_order);
    setViews(sortedViews);
    setDraggedViewId(null);

    const viewA = { ...currentViews[draggedIndex] };
    const viewB = { ...currentViews[targetIndex] };

    try {
      await fetch(`http://localhost:8000/views/${viewA.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewA) });
      await fetch(`http://localhost:8000/views/${viewB.views_pk}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(viewB) });
    } catch (error) { console.error("Error updating view order:", error); }
  };

  //Views CRUD 
  const handleCreateView = async () => {
    const finalViewName = newViewNameInput.trim() !== '' ? newViewNameInput : `view_${viewCounter}`;
    const newViewData = { views_name: finalViewName, views_order: views.length + 1, is_active: true };
    try {
      const response = await fetch('http://localhost:8000/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newViewData) });
      if (response.ok) {
        const result = await response.json();
        setViews([...views, result.data || result]);
        setViewCounter(viewCounter + 1); setNewViewNameInput('');
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleUpdateView = async (viewId, currentOrder) => {
    const updatedName = prompt("Escribe el nuevo nombre para esta vista:");
    if (!updatedName) return;
    const updatedViewData = { views_pk: viewId, views_name: updatedName, views_order: currentOrder, is_active: true };
    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedViewData) });
      if (response.ok) setViews(views.map(v => v.views_pk === viewId ? { ...v, views_name: updatedName } : v));
    } catch (error) { console.error('Error:', error); }
  };

  const handleDeleteView = async (viewId) => {
    const tieneTareas = tasks.some(t => t.views_pk === viewId && t.is_active !== false);
    if (tieneTareas) { alert("⚠️ No puedes borrar esta vista porque tiene tareas enlazadas. Borra las tareas primero."); return; }
    if (!window.confirm("¿Seguro que deseas eliminar esta vista?")) return;
    try {
      const response = await fetch(`http://localhost:8000/views/${viewId}`, { method: 'DELETE' });
      if (response.ok) setViews(views.filter(v => v.views_pk !== viewId));
    } catch (error) { console.error('Error:', error); }
  };

  const toggleTaskDropdown = (viewId) => setOpenDropdownViewId(openDropdownViewId === viewId ? null : viewId);

  // Funciones para Modales de Tareas
  const openTaskModal = (viewId) => { setTargetViewId(viewId); setTaskForm({ task_name: '', task_description: '', task_due_date: '', is_estatic: false }); setIsModalOpen(true); };
  const closeTaskModal = () => { setIsModalOpen(false); setTargetViewId(null); };

  const openEditTaskModal = (task) => { setEditTaskForm({ ...task, task_due_date: task.task_due_date || '' }); };
  const closeEditTaskModal = () => { setEditTaskForm(null); };

  //Tasks CRUD
  const handleCreateTask = async () => {
    if (!taskForm.task_name.trim()) return alert("El nombre es obligatorio.");
    const todayDate = new Date().toISOString().split('T')[0];

    //Payload para crear TASKS
    //PAYLOAD TASKS
    //SI hay tema con el back a la hora de agregar las tasks hay que revisar este payload comparandolo con el backend 
    const newTaskData = {
      task_name: taskForm.task_name,
      task_description: taskForm.task_description || "Sin descripción",
      task_status: "Pendiente",
      task_created_at: todayDate,
      task_updated_at: todayDate,
      task_due_date: taskForm.task_due_date || todayDate, // DUE DATE añadido
      tasks_order: tasks.filter(t => t.views_pk === targetViewId).length + 1,
      tasks_duration: taskForm.is_estatic ? "00:00:10" : "00:01:00",
      is_estatic: taskForm.is_estatic,
      is_active: true
    };

    try {
      const responseTask = await fetch('http://localhost:8000/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTaskData) });
      if (responseTask.ok) {
        const resultTask = await responseTask.json();
        const createdTask = resultTask.data || newTaskData;
        const newRelationData = { groups_tasks_views_name: `${createdTask.task_name}_view_${targetViewId}`, is_active: true, task_pk: createdTask.tasks_pk, views_pk: targetViewId };
        const responseRelation = await fetch('http://localhost:8000/groups_tasks_views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRelationData) });

        if (responseRelation.ok) { setTasks([...tasks, { ...createdTask, views_pk: targetViewId }]); closeTaskModal(); }
        else { alert("La tarea se creó, pero falló al enlazarla."); }
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleSaveUpdatedTask = async () => {
    if (!editTaskForm.task_name.trim()) return alert("El nombre es obligatorio.");
    const todayDate = new Date().toISOString().split('T')[0];

    const updatedTaskData = { ...editTaskForm, task_updated_at: todayDate };

    try {
      const response = await fetch(`http://localhost:8000/tasks/${editTaskForm.tasks_pk}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedTaskData)
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.tasks_pk === editTaskForm.tasks_pk ? updatedTaskData : t));
        closeEditTaskModal();
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleToggleLock = async (task) => {
    // Solo permitimos lock/unlock en frontend, luego se validará rol
    const updatedTaskData = { ...task, is_estatic: !task.is_estatic };
    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.tasks_pk}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedTaskData)
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.tasks_pk === task.tasks_pk ? updatedTaskData : t));
      }
    } catch (error) { console.error('Error toggling lock:', error); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) setTasks(tasks.filter(t => t.tasks_pk !== taskId));
    } catch (error) { console.error('Error:', error); }
  };

  //Controles de Video 
  //***********Pendiente*************
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); } else { videoRef.current.pause(); setIsPlaying(false); }
  };
  const handleFastForward = () => { if (videoRef.current) videoRef.current.currentTime += 5; };
  const handleRewind = () => { if (videoRef.current) videoRef.current.currentTime -= 5; };
  const handleTimeUpdate = () => { if (videoRef.current && videoRef.current.duration) setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100); };
  const handleProgressChange = (e) => { if (!videoRef.current) return; videoRef.current.currentTime = (e.target.value / 100) * videoRef.current.duration; setProgress(e.target.value); };

  const activeTasks = activeTimelineViewId ? tasks.filter(t => t.views_pk === activeTimelineViewId && t.is_active !== false) : [];
  const totalDurationSeconds = activeTasks.reduce((acc, task) => acc + parseDuration(task.tasks_duration), 0);

  const [taskComments, setTaskComments] = useState({});


  //STATUS
  const handleToggleStatus = async (task) => {
    const newStatus = task.task_status === 'Completada' ? 'Pendiente' : 'Completada';
    const todayDate = new Date().toISOString().split('T')[0];
    const updatedTaskData = { ...task, task_status: newStatus, task_updated_at: todayDate };

    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.tasks_pk}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedTaskData)
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.tasks_pk === task.tasks_pk ? updatedTaskData : t));
      }
    } catch (error) { console.error('Error toggling status:', error); }
  };

  //Chat
  const fetchTaskComments = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}/comments`);
      if (res.ok) {
        const result = await res.json();
        setTaskComments(prev => ({ ...prev, [taskId]: result.data || result }));
      }
    } catch (error) { console.error('Error fetching comments:', error); }
  };

  const handleAddComment = async (taskId, text, userRole) => {
    const commentData = {
      comments_description: text,
      created_by: userRole || 'admin',
      tasks_fk: taskId
    };
    try {
      const response = await fetch('http://localhost:8000/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(commentData)
      });
      if (response.ok) {
        // Recargar comentarios tras enviar
        fetchTaskComments(taskId);
      }
    } catch (error) { console.error('Error posting comment:', error); }
  };

  return (
    <div className="pipeline-container">

      {/* Modal: CREAR TAREA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#2c303a', padding: '25px', borderRadius: '8px', width: '400px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Crear Nueva Tarea</h3>

            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de la tarea:</label>
            <input type="text" value={taskForm.task_name} onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }} />

            <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
            <textarea value={taskForm.task_description} onChange={(e) => setTaskForm({ ...taskForm, task_description: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white', minHeight: '80px' }} />

            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Entrega (Due Date):</label>
            <input type="date" value={taskForm.task_due_date} onChange={(e) => setTaskForm({ ...taskForm, task_due_date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={closeTaskModal} style={{ padding: '8px 15px', background: '#555', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleCreateTask} style={{ padding: '8px 15px', background: '#4a90e2', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Tarea</button>
            </div>
          </div>
        </div>
      )}

      {editTaskForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#2c303a', padding: '25px', borderRadius: '8px', width: '400px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Actualizar Tarea</h3>

            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
            <input type="text" value={editTaskForm.task_name} onChange={(e) => setEditTaskForm({ ...editTaskForm, task_name: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }} />

            <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
            <textarea value={editTaskForm.task_description} onChange={(e) => setEditTaskForm({ ...editTaskForm, task_description: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white', minHeight: '80px' }} />

            <label style={{ display: 'block', marginBottom: '5px' }}>Estatus:</label>
            <select value={editTaskForm.task_status} onChange={(e) => setEditTaskForm({ ...editTaskForm, task_status: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }}>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            <label style={{ display: 'block', marginBottom: '5px' }}>Due Date (Fecha Límite):</label>
            <input type="date" value={editTaskForm.task_due_date || ''} onChange={(e) => setEditTaskForm({ ...editTaskForm, task_due_date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #555', background: '#1e2128', color: 'white' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={closeEditTaskModal} style={{ padding: '8px 15px', background: '#555', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveUpdatedTask} style={{ padding: '8px 15px', background: '#4caf50', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Cambios</button>
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

        <div className="video-controls-centered" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '10px 0' }}>
          <button onClick={handleRewind} className="control-btn">◀◀</button>
          <button onClick={togglePlay} className="control-btn play-main-btn">{isPlaying ? '⏸' : '▶'}</button>
          <button onClick={handleFastForward} className="control-btn">▶▶</button>

          {activeTimelineViewId && (
            <span style={{ color: '#aaa', fontSize: '14px', marginLeft: '20px' }}><strong>{formatDuration(totalDurationSeconds)}</strong></span>
          )}

          {activeTimelineViewId && (
            <Box sx={{ width: '200px', display: 'flex', alignItems: 'center', gap: 2, marginLeft: '20px' }}>
              <Slider
                size="small" value={timelineScale} min={0.05} max={2} step={0.01} onChange={(e, newValue) => setTimelineScale(newValue)}
                aria-label="Timeline Zoom" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: '#4a90e2' }}
              />
            </Box>
          )}
        </div>

        <div className="timeline-task-tracks" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100px', backgroundColor: '#111', marginBottom: '5px', overflowX: 'auto', overflowY: 'hidden', position: 'relative' }}>
          <div className="timeline-inner-track" style={{ display: 'flex', flexDirection: 'row', height: '100%', minWidth: `${Math.max(videoDuration * 5, 800) * timelineScale}px`, position: 'relative', transition: 'min-width 0.2s ease-out' }}>
            {activeTimelineViewId ? (
              activeTasks
                .sort((a, b) => a.tasks_order - b.tasks_order)
                .map(task => {
                  const durationInSecs = parseDuration(task.tasks_duration);
                  return (
                    <div
                      key={task.tasks_pk} title={`${task.task_name} (${task.tasks_duration})`}
                      draggable={!task.is_estatic}
                      onDragStart={(e) => {
                        if (task.is_estatic) e.preventDefault();
                        else onDragStartTask(e, task.tasks_pk);
                      }}
                      onDragOver={onDragOverTask}
                      onDrop={(e) => onDropTask(e, task.tasks_pk)}
                      style={{
                        width: `${(durationInSecs / videoDuration) * 100}%`, minWidth: '30px', height: '100%', backgroundColor: task.is_estatic ? '#555' : '#2196F3',
                        borderRight: '1px solid #000', borderLeft: '1px solid #000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', userSelect: 'none', cursor: task.is_estatic ? 'not-allowed' : 'grab', flexShrink: 0
                      }}>
                      {task.is_estatic && <span style={{ marginRight: '5px' }}>🔒</span>}
                      {task.task_name}
                      {!task.is_estatic && (
                        <div
                          onMouseDown={(e) => handleDragStart(e, task)}
                          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)', cursor: 'ew-resize' }}
                        />
                      )}
                    </div>
                  );
                })
            ) : (<div style={{ color: '#555', fontSize: '12px', width: '100%', textAlign: 'center', lineHeight: '40px' }}>Selecciona una vista para ver su pipeline</div>)}
          </div>
        </div>

        <div className="video-controls-bar" style={{ padding: '10px', width: '100%' }}>
          <div className="progress-bar-container" style={{ width: '100%' }}>
            <input type="range" min="0" max="100" value={progress || 0} onChange={handleProgressChange} className="progress-bar" style={{ width: '100%', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      <ViewsSection
        views={views}
        viewCounter={viewCounter}
        newViewNameInput={newViewNameInput}
        setNewViewNameInput={setNewViewNameInput}
        handleCreateView={handleCreateView}
        handleUpdateView={handleUpdateView}
        handleDeleteView={handleDeleteView}

        onDragStartView={onDragStartView}
        onDragOverView={onDragOverView}
        onDropView={onDropView}

        activeTimelineViewId={activeTimelineViewId}
        setActiveTimelineViewId={setActiveTimelineViewId}
        openDropdownViewId={openDropdownViewId}
        toggleTaskDropdown={toggleTaskDropdown}

        tasks={tasks}
        openTaskModal={openTaskModal}
        openEditTaskModal={openEditTaskModal}
        handleToggleLock={handleToggleLock}
        handleDeleteTask={handleDeleteTask}

        handleToggleStatus={handleToggleStatus}
        taskComments={taskComments}
        fetchTaskComments={fetchTaskComments}
        handleAddComment={handleAddComment}
        currentUserRole={userRole}

      />
    </div>
  );
}

export default Pipeline;