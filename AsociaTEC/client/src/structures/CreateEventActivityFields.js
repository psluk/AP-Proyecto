export const CreateEventActivityFields = [
    {
        label: "Nombre",
        type: "text",
        name: "name",
        placeholder: "Nombre de la actividad",
        required: true,
        maxLength: 64,
    },
    {
        label: "Lugar",
        type: "textarea",
        name: "place",
        placeholder: "Lugar de la actividad",
        required: true,
        maxLength: 128,
        rows: 2,
    },
    {
        label: "Fecha de inicio",
        type: "datetime-local",
        name: "startDate",
        placeholder: "Fecha de inicio",
        required: true,
    },
    {
        label: "Fecha de finalización",
        type: "datetime-local",
        name: "endDate",
        placeholder: "Fecha de finalización",
        required: true,
    }
];