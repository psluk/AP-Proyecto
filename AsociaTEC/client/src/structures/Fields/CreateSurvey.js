export const CreateSurvey = [
    {
        label: "Calificación",
        type: "select",
        name: "calificacion",
        options: [
            { value: "", label: "Cargando...", disabled: true },
        ],
        required: true,
    },
    {
        label: "Comentario",
        type: "textarea",
        name: "password",
        rows: 5,
        placeholder: "Deje sus comentario aquí",
        required: true,
    },
];