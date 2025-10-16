import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from "date-fns";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";

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

type Slot = { date: Date; timeSlot: string };

export const applyTaxAndDiscount = (
    amount: number,
    taxPercent: number,
    discountPercent: number
): number => {
    const afterTax = amount * (1 + taxPercent / 100);
    const afterDiscount = afterTax * (1 - discountPercent / 100);
    return afterDiscount;
};
