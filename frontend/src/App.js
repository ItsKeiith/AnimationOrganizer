import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import MainDashboard from './pages/MainDashboard/MainDashboard.jsx';
import Pipeline from './pages/Pipeline/Pipeline.jsx';
import Repositorio from './pages/Repositorio/Repositorio.jsx';
import Cronograma from './pages/Cronograma/Cronograma.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import VentanaGestionProyectos from './pages/VentanaGestionProyectos/VentanaGestionProyectos.jsx';
import VentanaGestionProduccion from './pages/VentanaGestionProduccion/VentanaGestionProduccion.jsx';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/proyectos" element={<VentanaGestionProyectos />} />
          <Route path="/produccion" element={<VentanaGestionProduccion />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/repositorio" element={<Repositorio />} />
          <Route path="/cronograma" element={<Cronograma />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;