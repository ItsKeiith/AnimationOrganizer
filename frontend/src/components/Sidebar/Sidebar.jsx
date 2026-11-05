import React from 'react'; import './Sidebar.css'; import { useNavigate } from "react-router-dom"; import { useState } from "react";
function Sidebar() {

    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    return (

        <div className={open ? "SideBar" : "SideBar closed"}>

            <button
                className="ToggleButton"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            {open && (

                <>

                    <button
                        className="Buttom"
                        onClick={() => navigate("/dashboard")}
                    >
                        Main Dashboard
                    </button>

                    <button
                        className="Buttom"
                        onClick={() => navigate("/pipeline")}
                    >
                        Pipeline
                    </button>

                    <button
                        className="Buttom"
                        onClick={() => navigate("/produccion")}
                    >
                        Produccion
                    </button>


                    <button
                        className="Buttom"
                        onClick={() => navigate("/repositorio")}
                    >
                        Repositorio
                    </button>

                    <button
                        className="Buttom"
                        onClick={() => navigate("/Cronograma")}
                    >
                        Cronograma
                    </button>

                    <button
                        className="Buttom"
                        onClick={() => navigate("/")}
                    >
                        Exit
                    </button>


                </>

            )}

        </div>

    );


}
export default Sidebar;