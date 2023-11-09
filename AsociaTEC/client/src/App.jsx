import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import AssociationSignUp from "./pages/SignUp/AssociationSignUp";
import StudentSignUp  from "./pages/SignUp/StudentSignUp";
import Profile from "./pages/Profile";
import AssociationList from "./pages/Associations/Index";
import Association from "./pages/Associations/Association";
import EventList from "./pages/Events/Index";
import CreateEvent from "./pages/Events/Create";
import StudentRegistrations from "./pages/Registrations/StudentRegistrations";
import CreateActivity from "./pages/Events/CreateActivity";
import CollaboratorList from "./pages/Collaborators/Index";
import Requests from "./pages/Collaborators/Requests";
import Proposal from "./pages/Students/Proposal";

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
                    <Route exact path="/sign-up/student" element={<StudentSignUp />} />
                    <Route exact path="/profile" element={<Profile />} />
                    <Route exact path="/associations" element={<AssociationList />} />
                    <Route exact path="/association/edit/:locationCode/:careerCode" element={<Association />} />
                    <Route exact path="/events" element={<EventList />} />
                    <Route exact path="/event/create" element={<CreateEvent/>} />
                    <Route exact path="/registrations" element={<StudentRegistrations/>} />
                    <Route exact path="/event/:uuid/create-activity" element={<CreateActivity/>} />
                    <Route exact path="/collaborators/:uuid" element={<CollaboratorList/>} />
                    <Route exact path="/collaborators/request/:uuid" element={<Requests/>} />
                    <Route exact path="/proposal/create/" element={<Proposal/>} />
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