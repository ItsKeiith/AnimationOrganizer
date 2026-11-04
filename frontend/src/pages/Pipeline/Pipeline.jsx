import React, { useRef, useState, useEffect } from 'react';
import './Pipeline.css';

// aqui estamos haciendo el control de roles 
function VideoPlayer({ userRole = 'admin', videoSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // manejo de play y pause 
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // actualizar la barra de progreso
  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  // control de video
  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  // solo admin 
  const handleAddTimeline = () => {
    console.log("Timeline agregado al proyecto");
    
  };

  return (
    <div className="video-container">
      {/* pantalla del video */}
      <div className="video-screen">
        <video 
          ref={videoRef} 
          src={videoSrc} 
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
        />
      </div>

      {/* control de produccion  */}
      <div className="video-controls">
        <button onClick={togglePlay} className="control-button">
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

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

      {/* solo admin */}
      {userRole === 'admin' && (
        <div className="admin-timeline-section">
          <button onClick={handleAddTimeline} className="admin-add-button">
            + Agregar Timeline
          </button>
          <p style={{ color: '#aaa', fontSize: '12px' }}>
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;