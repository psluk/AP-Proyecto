export const EditEventStructure = [
    {
        label: "Título del evento",
        type: "text",
        name: "titulo",
        placeholder: "",
        required: true,
    },
    {
        label: "Capacidad",
        type: "number",
        name: "capacidad",
        placeholder: "Capacidad del evento",
        required: true,
    },
    {
        label: "Lugar",
        type: "text",
        name: "lugar",
        placeholder: "Lugar del evento",
        required: true,
    },
    {
        label: "Fecha de inicio",
        type: "datetime-local",
        name: "fechaInicio",
        placeholder: "Fecha de Inicio",
        required: true,
    },
    {
        label: "Fecha de finalización",
        type: "datetime-local",
        name: "fechaFin",
        placeholder: "Fecha de Finalización",
        required: true,
    },
    {
        label: "Categorías",
        type: "select",
        name: "categoria",
        options: [
            { value: "", label: "Cargando...", disabled: true },
        ],
        required: true,
    },
    {
        label: "Descripción",
        type: "textarea",
        name: "descripcion",
        placeholder: "Descripción del evento",
        rows: 5,
        required: true,
    },
    {
        label: "Recursos especiales",
        type: "textarea",
        name: "especiales",
        placeholder: "Recursos especiales",
        rows: 5,
        required: true,
    }
]