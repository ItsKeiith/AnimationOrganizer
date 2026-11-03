import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesion con:", { user, password });
  };

  return (
    <div className="Login"> 
      <header className="Login-Header"> 
        <form onSubmit={handleLogin} className="Login-Form"> 
          <p className="Login-Title">ANIDEP</p> 
          
          <div> 
            <label>User: </label> 
            <input 
              type="text" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
              placeholder="admin" 
            /> 
          </div>

          <div>
            <label>Password: </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="********"
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </header>
    </div>
  );
};

export default Login;