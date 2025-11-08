import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from "date-fns";

export type FilterBy = "day" | "week" | "month" | "year" | undefined;

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
