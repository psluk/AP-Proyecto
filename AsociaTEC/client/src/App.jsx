import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import AssociationSignUp from "./pages/SignUp/AssociationSignUp";
import Profile from "./pages/Profile";
import AssociationList from "./pages/Associations/Index";
import Association from "./pages/Associations/Association";

function App() {
    return (
        <>
            <NavBar />
            <div id="mainContent">
                <Routes>
                    <Route exact path="/" element={<>
                        <h1>Home</h1>
                        <p className="font-sans">Contenido (sans).</p>
                        <p className="font-serif">Contenido (serif).</p>
                        <p className="font-mono">Contenido (mono).</p>
                        </>} /> 
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/sign-up/association" element={<AssociationSignUp />} />
                    <Route exact path="/profile" element={<Profile />} />
                    <Route exact path="/associations" element={<AssociationList />} />
                    <Route exact path="/edit/association/:locationCode/:careerCode" element={<Association />} />
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