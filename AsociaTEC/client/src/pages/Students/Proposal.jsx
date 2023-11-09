import FormItems from "../../components/forms/FormItems";
import { LoginFields } from "../../structures/LoginFields";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSessionContext } from "../../context/SessionComponent";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useEffect, useState } from "react";
import { ProposalStructure } from "../../structures/CreateProposalFields"

// lista asociaciones, titulo, tematica, objetivos, actividades, otros

/*
val url = "https://asociatec.azurewebsites.net/api/propuestas/agregar"

                    val requestBody =
                        ("{\"carnet\": \"${user.getStudentNumber()}\"," +
                                "\"codigoCarrera\": \"$selectedAssociationCareer\"," +
                                "\"codigoSede\": \"$selectedAssociationLocation\"," +
                                "\"titulo\": \"$title\"," +
                                "\"tematica\": \"$theme\"," +
                                "\"objetivos\": \"$objectives\"," +
                                "\"actividades\": \"$activities\"," +
                                "\"otros\": \"$others\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)
*/

const Proposal = () => {
    const navigate = useNavigate();
    const { getEmail, isLoggedIn, getUniId, getCareerCode, getLocationCode } = useSessionContext();
    const [associations, setAssociations] = useState([]);
    const [fields, setFields] = useState(ProposalStructure);
    const [data, setData] = useState({});
    const [fulldata, setFulldata] = useState({});


    useEffect(() => {

        // Redirect if not logged in
        if (isLoggedIn == null) {
            navigate("/login");
            toast.error("Session no iniciada", messageSettings);
        }

        setFulldata((prev) => ({
            ...prev,
            carnet: getUniId
        }));
        

        axios.get('/api/asociaciones', { withCredentials: true }).then((res) => {

            console.log(res.data)
            setAssociations(res.data)
            if (res.data.length > 0) {
                setFields((prev) => {
                    setFulldata((prev) => ({
                        ...prev,
                        codigoCarrera: res.data[0].carrera.codigo,
                        codigoSede: res.data[0].sede.codigo
                    }));
                    const newFields = [...prev];
                    newFields[0].options = res.data.map((item) => ({
                        label: item.asociacion.nombre,
                        value: `${item.sede.codigo}/${item.carrera.codigo}`
                    }));
                    return newFields;
                });
            }
        })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });

    }, []);

    useEffect(() => {

        if (data.asociacion) {

            console.log("data.aso2", data)

            const stringArray = data.asociacion.split('/');

            setFulldata((data) => ({

                ...data,
                codigoCarrera: stringArray[1],
                codigoSede: stringArray[0]
            }));
        }
    }, [data])


    const handleSumit = (e) => {
        e.preventDefault()

        if (typeof fulldata.carnet === "string") {
            const theBody = {
                ...fulldata, 
                titulo: data.titulo,
                tematica: data.tematica,
                objetivos: data.objetivos,
                actividades: data.actividades,
                otros: data.otros
            }
            console.log(theBody)
            axios.post('/api/propuestas/agregar', theBody, { withCredentials: true }).then((res) => {
    
                toast.success("Propuesta creada con éxito", messageSettings);
                navigate('/')
    
            })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.mensaje || defaultError,
                        messageSettings
                    );
                });
        } else {
            toast.error("Debe iniciar sessión", messageSettings);
        }
        
    };

    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">

            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Nueva Propuesta 
            </h1>
            <p>
                A continuación se podrá realizar una propuesta a la asociación de su preferencia
            </p>

            <form
                className="w-full space-y-4"
                onSubmit={handleSumit}>
                <FormItems
                    fields={fields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className=" bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key={"submit"}
                >
                    Proponer
                </button>
            </form>
        </div>
    );
};

export default Proposal;