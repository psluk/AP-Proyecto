import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import AssociationSignUp from "./pages/SignUp/AssociationSignUp";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/Events/Create";

function App() {
    return (
        <>
            <NavBar />
            <div id="mainContent">
                <Routes>
                    <Route path="/" element={<>
                        <h1>Home</h1>
                        <p className="font-sans">Contenido (sans).</p>
                        <p className="font-serif">Contenido (serif).</p>
                        <p className="font-mono">Contenido (mono).</p>
                        </>} /> 
                    <Route path="/login" element={<Login />} />
                    <Route path="/sign-up/association" element={<AssociationSignUp />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="create_event" element={<CreateEvent/>} />
                </Routes>
            </div>
            <ToastContainer />
        </>
    );
}

function Main() {
    return (
        <SessionProvider>
            <App />
        </SessionProvider>
    );
}

export default Main;