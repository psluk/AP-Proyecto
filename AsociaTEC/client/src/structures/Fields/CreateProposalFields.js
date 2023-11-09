export const ProposalStructure = [
    {
        label: "Asociación",
        type: "select",
        name: "asociacion",
        options: [],
        required: true
    },
    {
        label: "Título del evento",
        type: "text",
        name: "titulo",
        placeholder: "Título del evento",
        required: true
    },
    {
        label: "Temática",
        type: "text",
        name: "tematica",
        placeholder: "Temática del evento",
        required: true,
    },
    {
        label: "Objetivos",
        type: "textarea",
        name: "objetivos",
        placeholder: "Objetivos",
        required: true,
    },
    {
        label: "Actividades",
        type: "textarea",
        name: "actividades",
        placeholder: "Actividades",
        required: true,
    },
    {
        label: "Otros (opcional)",
        type: "textarea",
        name: "otros",
        placeholder: "Detalles adicionales del evento",
        required: false,
    },
]