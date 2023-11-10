import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { messageSettings } from "../../utils/messageSettings";
import ProposalCard from "../../components/cards/Proposal";
import { useSessionContext } from "../../context/SessionComponent";

/*
    {
        "id": "3063E2A5-9090-404A-964E-462C60221435",
        "titulo": "prueba1",
        "tematica": "cualquiera",
        "objetivos": "ninguno",
        "fecha": "2023-11-09T05:08:28.347",
        "estado": "Sin revisar",
        "estudiante": {
            "carnet": 2017071427,
            "nombre": "Tomás",
            "apellido1": "Retana",
            "apellido2": "Bonilla"
        },
        "asociacion": {
            "nombre": "ASEMCA",
            "carrera": "AE",
            "sede": "CA"
        }
    }

    url = /api/propuestas/modificar

    body =  {"propuesta": "uuid",
             "estado": "status"
            }
    //se accepta(3), se rechaza(4) -> modifica estado

    url/detalles?propuesta=uuid


    

*/





const ProposalList = () => {
    const { getEmail, isLoggedIn, getUniId, getCareerCode, getLocationCode } = useSessionContext();
    const [proposals, setProposals] = useState([]);
    const [filter, setFilter] = useState([]);
    const [associations, setAssociations] = useState([]);


    const setNewValues = (uuid, text) =>{
        
        axios.post("/api/propuestas/modificar",{propuesta: uuid, estado: text},{ withCredentials: true })
            .then((response) => {
                
                toast.success("Propuesta modificada correctamente", messageSettings);
                setFilter([...filter, {filter_uuid: uuid}])
                const temp = [...filter, {filter_uuid: uuid}]
                const exclusionSet = new Set(temp.map(item => item.filter_uuid));
                const newvalues = proposals.filter(obj => !exclusionSet.has(obj.filter_uuid))
                setProposals(newvalues);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró modificar la propuesta", messageSettings);
            });
    }
 
    const acceptProposal = (uuid) => {
        setNewValues(uuid, "Aceptada")
        console.log("acceptar")

    };
    const declineProposal = (uuid) => {
        setNewValues(uuid, "Rechazada")
        console.log("rechazar")

    };
    
    // Loading the data
    useEffect(() => {
        axios.get(`/api/propuestas/?codigoCarrera=${getCareerCode()}&codigoSede=${getLocationCode()}&?estado=Sin revisar`)
            .then((response) => {
                
                const prop = response.data
                setProposals(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se pudieron cargar las propuestas", messageSettings);
            });
    }, []);

    return (
        <div className="py-5 sm:px-5 w-full md:px-12 lg:px-20 flex-auto">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Propuestas
            </h1>
            {
                proposals.length > 0
                ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">{
                    proposals.map((proposal, index) => (
                        <ProposalCard proposal={proposal} key={index} onDecline={declineProposal} onAccept={acceptProposal} />
                    ))
                }</div>
                : <p className="text-gray-600 italic text-center">Cargando...</p>
            }
        </div>
    )
};

export default ProposalList;