import { format, getWeek, getYear } from "date-fns";

type FilterBy = "day" | "week" | "month" | "year" | undefined;

export interface Payment {
    paidAt: Date
    package: { price: number };
}

interface GroupedResult {
    label: string;
    total: number;
}

export const groupRevenue = (
    data: Payment[],
    filterBy: FilterBy,
): GroupedResult[] => {
    const groups: Record<string, number> = {};

    for (const item of data) {
        const date = item.paidAt;
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

        groups[key] = (groups[key] || 0) + item.package.price;
    }

    // Convert to array and sort chronologically
    return Object.entries(groups)
        .map(([label, total]) => ({ label, total }))
        .sort(
            (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime(),
        );
};
