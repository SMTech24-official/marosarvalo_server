import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    format,
    getWeek,
    getYear,
} from "date-fns";

type FilterBy = "day" | "week" | "month" | "year" | undefined;

export const getDateRange = (filterBy: FilterBy) => {
    const now = new Date();

    switch (filterBy) {
        case "day":
            return {
                gte: startOfDay(now),
                lte: endOfDay(now),
            };

        case "week":
            return {
                gte: startOfWeek(now, { weekStartsOn: 1 }), // Monday
                lte: endOfWeek(now, { weekStartsOn: 1 }),
            };

        case "month":
            return {
                gte: startOfMonth(now),
                lte: endOfMonth(now),
            };

        default:
            return {
                gte: startOfMonth(now),
                lte: endOfMonth(now),
            };
    }
};

interface Appointment {
    date: Date;
}

interface GroupedResult {
    label: string;
    total: number;
}

export const groupAppointment = (
    data: Appointment[],
    filterBy: FilterBy
): GroupedResult[] => {
    const groups: Record<string, number> = {};

    for (const item of data) {
        const date = item.date;
        let key: string;

        switch (filterBy) {
            case "day":
                key = format(date, "MMM dd, yyyy"); // e.g. Oct 04, 2025
                break;
            case "week":
                key = `Week ${getWeek(date)} (${getYear(date)})`;
                break;
            case "month":
                key = format(date, "MMM, yyyy"); // e.g. Oct 2025
                break;
            case "year":
                key = format(date, "yyyy"); // e.g. 2025
                break;
            default:
                key = format(date, "MMM dd, yyyy"); // e.g. Oct 04
                break;
        }

        groups[key] = (groups[key] || 0) + 1;
    }

    // Convert to array and sort chronologically
    return Object.entries(groups)
        .map(([label, total]) => ({ label, total }))
        .sort(
            (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime()
        );
};

export const parseTimeString = (timeStr: string) => {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (!match) throw new Error("Invalid time format");

    let [_, hours, minutes, meridiem] = match;
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (meridiem.toLowerCase() === "pm" && h !== 12) h += 12;
    if (meridiem.toLowerCase() === "am" && h === 12) h = 0;

    return { hours: h, minutes: m };
};
