import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";

const ProposalDetails = () => {
    const { uuid } = useParams();
    const { getUserType, isLoggedIn } = useSessionContext();
    const [proposal, setProposal] = useState([]);

    const setNewValues = (text) => {

        axios.post("/api/propuestas/modificar", { propuesta: uuid, estado: text }, { withCredentials: true })
            .then((response) => {

                toast.success("Propuesta modificada correctamente", messageSettings);
                setFilter([...filter, { filter_uuid: uuid }])
                const temp = [...filter, { filter_uuid: uuid }]
                const exclusionSet = new Set(temp.map(item => item.filter_uuid));
                const newvalues = proposals.filter(obj => !exclusionSet.has(obj.filter_uuid))
                setProposals(newvalues);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró modificar la propuesta", messageSettings);
            });
    }

    const accept = (e) => {
        e.preventDefault();
        setNewValues("Aceptada")

    }
    const decline = (e) => {
        e.preventDefault();
        setNewValues("Rechazada")

    }


    // Load locations and association data
    useEffect(() => {
        console.log(uuid)
        axios.get(`/api/propuestas/detalles/?propuesta=${uuid}`)
            .then((response) => {
                const prop = response.data[0]
                setProposal(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar la propuesta", messageSettings);
            });

    }, [uuid]);



    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Propuesta
            </h1>
            <ul className="flex flex-col space-y-2">

                {proposal.id ? <li><b>ID Propuesta: </b> {proposal.id}</li> : <></>}
                {proposal.titulo ? <li><b>Título: </b> {proposal.titulo}</li> : <></>}
                {proposal.tematica ? <li><b>Temática: </b> {proposal.tematica}</li> : <></>}
                {proposal.objetivos ? <li><b>Objetivos: </b> {proposal.objetivos}</li> : <></>}
                {proposal.actividades ? <li><b>Actividades: </b> {proposal.actividades}</li> : <></>}
                {proposal.otros ? <li><b>Otros: </b> {proposal.otros}</li> : <></>}
            </ul>
            <div className="space-x-2">
                <button
                    className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                    type="button"
                    key="logout"
                    onClick={accept}
                >
                    Aceptar
                </button>
                <button
                    className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded-lg w-fit"
                    type="button"
                    key="logout"
                    onClick={decline}
                >
                    Rechazar
                </button></div>

        </div>
    );
};

export default ProposalDetails;


/*
<ul className="flex flex-col space-y-2">
                { getName() ? <li><b>Nombre:</b> { getName() }</li> : <></> }
                { getUniId() ? <li><b>Carné:</b> { getUniId() }</li> : <></> }
                { getUserType() ? <li><b>Tipo de perfil:</b> { getUserType() }</li> : <></> }
                { getLocationCode() ? <li><b>Sede:</b> { getLocationName() + " (" + getLocationCode() + ")"}</li> : <></> }
                { getCareerCode() ? <li><b>Carrera:</b> { getCareerName() + " (" + getCareerCode() + ")" }</li> : <></> }
                { getEmail() ? <li><b>Correo electrónico:</b>{" "}
                    <a
                        className="text-venice-blue-700 hover:underline cursor-pointer"
                        href={`mailto:${getEmail()}`}>
                            { getEmail() }
                    </a></li> : <></> }
            </ul>
            <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg w-fit"
                type="button"
                key="logout"
                onClick={attemptLogout}
            >
                Cerrar sesión
            </button>
            {
                getUserType() !== "Administrador"
                ? <p className="mt-4 text-gray-600 text-center">
                    Para modificar su perfil, por favor, contacte a un administrador.
                </p>
                : <></>
            }
*/