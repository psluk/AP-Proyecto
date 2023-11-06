import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/" element={<h1>Home</h1>} />
                <Route path="/login" element={<h1>Login</h1>} />
            </Routes>
            <p className="font-sans">Contenido (sans).</p>
            <p className="font-serif">Contenido (serif).</p>
            <p className="font-mono">Contenido (mono).</p>
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