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
import GestionUsuarios from './pages/GestionUsuarios/GestionUsuarios.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          {/* Rutas protegidas pro  el protected route */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/repositorio" element={<Repositorio />} />
            <Route path="/cronograma" element={<Cronograma />} />
            <Route path="/proyectos" element={<VentanaGestionProyectos />} />

            {/* Rutas de admim*/}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/produccion" element={<VentanaGestionProduccion />} />
              <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
            </Route>

          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;