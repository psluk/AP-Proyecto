import React from 'react'
import FormItems from '../../components/forms/FormItems'
import { Form } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { EventStructure } from '../../structures/CreateEventFields'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {

    const [data, setData] = useState({categoria:""})
    const [fields, setFields] = useState(EventStructure)
    const { session } = useSessionContext();

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser === null) {
            navigate("/");
        }
    }, []);

    const saveCategories = (categorias) => {
        if (categorias.length === 0) {
            setData((prev) => ({
                ...prev,
                categoria: "",
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[5].options = [
                    {
                        value: "",
                        label: "Cargando...",
                        disabled: true,
                    },
                ];
                return newFields;
            });
            return;
        }
        setFields((prev) => {
            setData((prev) => ({
                ...prev,
                categoria: categorias[0].categoria,
            }));
            const newFields = [...prev];
            newFields[5].options = categorias.map((categoria) => ({
                label: categoria.categoria,
                value: categoria.categoria,
            }));
            return newFields;
        });
    };

    useEffect(() => {
        document
            .getElementById("categoria")
            ?.classList.add("italic", "text-gray-400");

        axios.get("/api/eventos/categorias", { withCredentials: true }).then((res) => {
            saveCategories(res.data);
            document
                .getElementById("categoria")
                ?.classList.remove("italic", "text-gray-400");
        });
    }, []);

    return (
        <div className='p-5 md:w-2/4 md:flex md:flex-col md:items-center'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Crear Evento
            </h1>
            <form className="w-full max-w-4xl md:grid md:grid-cols-2 md:gap-10 md:mt-4 md:p-6 space-y-4 md:space-y-0 shadow-lg border rounded-md">
                <FormItems
                    fields={EventStructure}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <div className='col-span-2 flex flex-col items-center'>
                    <button
                        className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                        type="submit"
                    >
                        Crear Evento
                    </button>
                </div>

            </form>
        </div>
    )
}