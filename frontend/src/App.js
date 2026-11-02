import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Pipeline from './pages/Pipeline/Pipeline.jsx';
import Repositorio from './pages/Repositorio/Repositorio.jsx';
import Cronograma from './pages/Cronograma/Cronograma.jsx';

function App() {
  return (

    <div className="App">


      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/repositorio" element={<Repositorio />} />
        <Route path="/cronograma" element={<Cronograma />} />

      </Routes>

    </div>

  );
}
export default App;