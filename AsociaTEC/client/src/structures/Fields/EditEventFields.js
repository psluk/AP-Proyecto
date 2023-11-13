export const EditEventStructure = [
    {
        label: "Título del evento",
        type: "text",
        name: "titulo",
        placeholder: "",
        required: false
    },
    {
        label: "Capacidad",
        type: "number",
        name: "capacidad",
        placeholder: "Capacidad del evento",
        required: false,
    },
    {
        label: "Lugar",
        type: "text",
        name: "lugar",
        placeholder: "Lugar del evento",
        required: false,
    },
    {
        label: "Fecha de inicio",
        type: "datetime-local",
        name: "fechaInicio",
        placeholder: "Fecha de Inicio",
        required: false,
    },
    {
        label: "Fecha de finalización",
        type: "datetime-local",
        name: "fechaFin",
        placeholder: "Fecha de Finalización",
        required: false,
    },
    {
        label: "Categorias",
        type: "select",
        name: "categoria",
        options: [
            { value: "", label: "Cargando...", disabled: true },
        ],
        required: false,
    },
    {
        label: "Descripción",
        type: "textarea",
        name: "descripcion",
        placeholder: "Descripción del evento",
        rows: 5,
        required: false,
    },
    {
        label: "Recursos especiales",
        type: "textarea",
        name: "especiales",
        placeholder: "Recursos especiales",
        rows: 5,
        required: false,
    }
]