export const EventStructure = [
    {
        label: "Título del evento",
        type: "text",
        name: "titulo",
        placeholder: "Título del evento",
        required: true
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
        label: "Fecha de Inicio",
        type: "datetime-local",
        name: "fechaInicio",
        placeholder: "Fecha de Inicio",
        required: true,
    },
    {
        label: "Fecha de Finalización",
        type: "datetime-local",
        name: "fechaFin",
        placeholder: "Fecha de Finalización",
        required: true,
    },
    {
        label: "Categoria",
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
    },
]