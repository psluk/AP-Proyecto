import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "./context/SessionComponent";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Menu from "./pages/Menu";
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
import CreateProposal from "./pages/Proposals/Create";
import EditActivity from "./pages/Events/EditActivity";
import EditEvent from "./pages/Events/Edit";
import ProposalList from "./pages/Proposals/ProposalList";
import DetailsProposal from "./pages/Proposals/ProposalDetails";


function App() {
    return (
        <>
            <NavBar />
            <div id="mainContent">
                <Routes>
                    <Route exact path="/" element={<Menu />} /> 
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/sign-up/association" element={<AssociationSignUp />} />
                    <Route exact path="/sign-up/student" element={<StudentSignUp />} />
                    <Route exact path="/profile" element={<Profile />} />
                    <Route exact path="/associations" element={<AssociationList />} />
                    <Route exact path="/association/edit/:locationCode/:careerCode" element={<Association />} />
                    <Route exact path="/events" element={<EventList />} />
                    <Route exact path="/event/create" element={<CreateEvent/>} />
                    <Route exact path="/event/edit/:uuid" element={<EditEvent/>} />
                    <Route exact path="/my-events" element={<StudentRegistrations/>} />
                    <Route exact path="/event/:uuid/create-activity" element={<CreateActivity/>} />
                    <Route exact path="/event/:e_uuid/edit-activity/:a_uuid" element={<EditActivity/>} />
                    <Route exact path="/collaborators/:uuid" element={<CollaboratorList/>} />
                    <Route exact path="/collaborators/request/:uuid" element={<Requests/>} />
                    <Route exact path="/proposal/create" element={<CreateProposal/>}/>
                    <Route exact path="/proposal/details/:uuid" element={<DetailsProposal/>}/>
                    <Route exact path="/proposals" element={<ProposalList/>} />
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