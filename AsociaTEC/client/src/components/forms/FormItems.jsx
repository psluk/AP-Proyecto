const FormItems = ({ fields, formItemsData, setFormItemsData }) => {
    return (
        <>
            {fields.map((field, index) => (
                <div className="flex flex-col w-full h-fit" key={index}>
                    <label className="grow font-bold" htmlFor={field.name}>
                        {field.label}
                    </label>
                    {field.type === "select" ? (
                        <select
                            id={field.name}
                            className="grow py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50"
                            value={formItemsData[field.name || ""]}
                            key={index}
                            onChange={(e) => {
                                setFormItemsData((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                }));
                            }}
                        >
                            {field.options.map((option, optionIndex) => (
                                <option value={option.value} key={optionIndex} disabled={option.disabled || false}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : field.type === "textarea" ?
                    <textarea
                        className="grow py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50 resize-none"
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                            setFormItemsData((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                            }));
                        }}
                        required={field.required}
                        value={formItemsData[field.name] || ""}
                        pattern={field.pattern}
                        maxLength={field.maxLength}
                        rows={field.rows || 3}
                    ></textarea>
                    :
                    (
                        <input
                            className="grow py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50"
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            onChange={(e) => {
                                setFormItemsData((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                }));
                            }}
                            required={field.required}
                            value={formItemsData[field.name] || ""}
                            pattern={field.pattern}
                            maxLength={field.maxLength}
                            min={field.min}
                            max={field.max}
                        />
                    )
                    }
                </div>
            ))}
        </>
    );
};

export default FormItems;
