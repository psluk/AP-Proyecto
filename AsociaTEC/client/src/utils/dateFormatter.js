const dateLanguage = ["es-UY", "es-CR"]; // Returns "set" for September
const dateOptions = {
    short: { year: "numeric", month: "short", day: "numeric" },
    long: { year: "numeric", month: "long", day: "numeric" },
    full: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
};
const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
};

export const localHtmlAttribute = (apiDateString) => {
    const apiDate = new Date(apiDateString + "Z");
    return new Date(
        Date.UTC(
            apiDate.getFullYear(),
            apiDate.getMonth(),
            apiDate.getDate(),
            apiDate.getHours(),
            apiDate.getMinutes(),
            apiDate.getSeconds()
        )
    )
        .toISOString()
        .split(".")[0];
};

export const currentLocalHtmlAttribute = () => {
    const currentDate = new Date();
    return new Date(
        Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            currentDate.getHours(),
            currentDate.getMinutes(),
            currentDate.getSeconds()
        )
    )
        .toISOString()
        .split(".")[0];
}

export const localDate = (apiDateString, dateType) => {
    try {
        const apiDate = new Date(apiDateString + "Z");
        return apiDate.toLocaleDateString(
            dateLanguage,
            dateOptions[dateType] || dateOptions.short
        );
    } catch (error) {
        return "";
    }
};

export const localTime = (apiDateString, timeType) => {
    try {
        const apiDate = new Date(apiDateString + "Z");
        const currentTimeOptions = timeOptions;

        if (timeType === "short") {
            delete currentTimeOptions.second;
        }

        // Some browsers mistakenly return 00:00 a. m. for 12:00 a. m., so we replace it with 12:00 a. m.
        return apiDate
            .toLocaleTimeString(dateLanguage, currentTimeOptions)
            .replace(/^00/, "12");
    } catch (error) {
        return "";
    }
};

export const localDateTime = (apiDateString, dateType, timeType) => {
    return `${localTime(apiDateString, timeType)} el ${localDate(
        apiDateString,
        dateType
    )}`.trim();
};

export const isoString = (dateTimeString) => {
    try {
        const localDate = new Date(dateTimeString);
        return localDate.toISOString();
    } catch (error) {
        return "";
    }
};