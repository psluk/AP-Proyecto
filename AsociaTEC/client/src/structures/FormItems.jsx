const FormItems = ({ fields, formItemsData, setFormItemsData }) => {
    return (
        <>
            {fields.map((field, index) => (
                <>
                    <div className="flex flex-col w-full" key={index}>
                        <label className="grow font-bold">{field.label}</label>
                        <input
                            className="grow py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50"
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            onChange={(e) => {setFormItemsData((prev) => ({ ...prev, [field.name]: e.target.value }));}}
                            required={field.required}
                            value={formItemsData[field.name] || ""}
                        />
                    </div>
                </>
            ))}
        </>
    );
};

export default FormItems;
