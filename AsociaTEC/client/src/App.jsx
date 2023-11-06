import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";

function App() {
    return (
        <>
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