export const CreateSurvey = [
    {
        label: "Calificación",
        type: "select",
        name: "calificacion",
        options: [
            {
                label: "5",
                value: 5,
            },
            {
                label: "4",
                value: 4,
            },
            {
                label: "3",
                value: 3,
            },
            {
                label: "2",
                value: 2,
            },
            {
                label: "1",
                value: 1,
            },
        ],
        required: true,
    },
    {
        label: "Comentario",
        type: "textarea",
        name: "password",
        rows: 5,
        placeholder: "Deje sus comentario aquí",
        required: false,
    },
];