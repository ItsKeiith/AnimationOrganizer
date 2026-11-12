import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css';

function Login() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', user);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      console.log('STATUS :', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      const token = data.access_token;

      console.log('RESPUESTA :', data);

      //TOKEN de Usuario
      localStorage.setItem('fastapi_token', token);

      //Buscamos extraer el token de usario 
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userRole = tokenPayload.role; //

      //Guardamos el rol en local storage para validar permisos en otras pantallas
      localStorage.setItem('user_role', userRole);
      console.log('TOKEN FASTAPI GUARDADO. ROL:', userRole);

      //Redireccion a cada uno
      if (userRole === 'admin') {
        // ADMIN
        navigate('/dashboard', { replace: true });
      } else {
        // USER
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('ERROR COMPLETO:', error);
      setErrorMsg(error.message || 'Error desconocido');
    }
  };

  return (
    <div className="Login">
      <header className="Login-Header">
        <form onSubmit={handleLogin} className="Login-Form">

          <p className="Login-Title">
            ANIDEP
          </p>

          {errorMsg && (
            <p style={{ color: '#946f97', textAlign: 'center' }}>
              {errorMsg}
            </p>
          )}

          <div>
            <label>User:</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            Login
          </button>
        </form>
      </header>
    </div>
  );
}

export default Login;