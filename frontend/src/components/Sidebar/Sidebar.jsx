import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    // Bloqueo de Roles
    const userRole = localStorage.getItem('user_role');

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('fastapi_token');
        localStorage.removeItem('user_role');
        navigate('/', { replace: true });
    };

    return (
        <div className={open ? "SideBar" : "SideBar closed"}>
            <button className="ToggleButton" onClick={() => setOpen(!open)}>
                ☰
            </button>

            {open && (
                <>
                    <button className="Buttom" onClick={() => navigate("/dashboard")}>
                        Main Dashboard
                    </button>

                    <button className="Buttom" onClick={() => navigate("/pipeline")}>
                        Pipeline
                    </button>

                    {/* Estamos bloqueando por aqui tambien  */}
                    {userRole === 'admin' && (
                        <button className="Buttom" onClick={() => navigate("/produccion")}>
                            Produccion
                        </button>
                    )}

                    <button className="Buttom" onClick={() => navigate("/repositorio")}>
                        Repositorio
                    </button>

                    <button className="Buttom" onClick={() => navigate("/cronograma")}>
                        Cronograma
                    </button>


                    <button className="Buttom" onClick={handleLogout}>
                        Exit
                    </button>
                </>
            )}
        </div>
    );
}
export default Sidebar;