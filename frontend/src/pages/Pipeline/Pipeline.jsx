import React, { useRef, useState } from 'react';
import './Pipeline.css';

function Pipeline({ userRole = 'admin', projectName = 'Proyecto X', videoSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Manejo de play y pause
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

  // Botón para adelantar 5 segundos
  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 5;
    }
  };

  // Botón para atrasar 5 segundos
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 5;
    }
  };

  // Actualizar la barra de progreso
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  // Control manual de la barra de progreso
  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  // Solo admin: Agregar Timeline
  const handleAddTimeline = () => {
    console.log("Timeline agregado al proyecto");
  };

  // Solo admin: Agregar Vista
  const handleAddView = () => {
    console.log("Nueva vista agregada al proyecto");
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

        {/* Controles del video: Atrasar, Play/Pause centrado, Adelantar */}
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

        {/* Barra de progreso / timeline del video */}
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