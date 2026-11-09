import React, { useRef, useState } from 'react';
import './Pipeline.css';

// 1. Quitamos el "async" de aquí. React no soporta componentes async.
function Pipeline({ userRole = 'admin', projectName = 'Proyecto X', videoSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // ------------------ CRUD de las views ----------------
  // 2. Encapsulamos los fetch en funciones. Así no se ejecutan solos al cargar la página.
  
  const handleCreateView = async () => {
    // Aquí debes definir la información que vas a enviar
    // const formData = new FormData(); 
    // formData.append('views_name', 'Nueva Vista');

    try {
      const response = await fetch('http://localhost:8000/views', {
        method: 'POST',
        // body: formData, // Descomenta esto cuando definas formData
      });
      console.log('Vista creada');
    } catch (error) {
      console.error('Error al crear la vista:', error);
    }
  };

  const handleUpdateView = async () => {
    try {
      const response = await fetch('http://localhost:8000/views', {
        method: 'PUT',
        // body: formData,
      });
    } catch (error) {
      console.error('Error al actualizar la vista:', error);
    }
  };

  const handleDeleteView = async () => {
    try {
      const response = await fetch('http://localhost:8000/views', {
        method: 'DELETE',
        // body: formData,
      });
    } catch (error) {
      console.error('Error al eliminar la vista:', error);
    }
  };

  // -------------------- Crud de las tasks --------------------
  
  const handleCreateTask = async () => {
    try {
      // Ojo: tu endpoint en el backend es /tasks (con 's'), no /taks
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        // body: formData,
      });
    } catch (error) {
      console.error('Error al crear la tarea:', error);
    }
  };

  // -------------------- Controles de Video --------------------

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 5;
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 5;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration) {
      setProgress((current / duration) * 100);
    }
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const handleAddTimeline = () => {
    console.log("Timeline agregado al proyecto");
  };

  const handleAddView = () => {
    console.log("Nueva vista agregada al proyecto");
    // Puedes llamar a tu fetch aquí cuando el usuario haga clic en el botón de agregar
    // handleCreateView(); 
  };

  return (
    <div className="pipeline-container">
      {/* Header con el nombre del proyecto */}
      <div className="project-header">
        <h2>{projectName}</h2>
      </div>

      {/* Pantalla de reproducción */}
      <div className="video-container">
        <div className="video-screen">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="video-element"
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
            />
          ) : (
            <div className="no-content-message">
              Aun no hay contenido
            </div>
          )}
        </div>

        {/* Controles del video */}
        <div className="video-controls-centered">
          <button onClick={handleRewind} className="control-btn" title="Atrasar 5s">
            ◀◀
          </button>

          <button onClick={togglePlay} className="control-btn play-main-btn">
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button onClick={handleFastForward} className="control-btn" title="Adelantar 5s">
            ▶▶
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="video-controls-bar">
          <div className="progress-bar-container">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleProgressChange}
              className="progress-bar"
            />
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="admin-timeline-section">
            <button onClick={handleAddTimeline} className="admin-add-button">
              + Agregar Timeline
            </button>
          </div>
        )}
      </div>

      <div className="views-section-container">
        <div className="views-header-row">
          <h3>Vistas de Produccion</h3>
          {/* Este botón ahora disparará la función correcta */}
          <button onClick={handleAddView} className="add-view-button" title="Agregar vista">
            +
          </button>
        </div>
        <div className="views-content-area">
          <p className="empty-views-text">No hay vistas agregadas todavia</p>
        </div>
      </div>
    </div>
  );
}

export default Pipeline;