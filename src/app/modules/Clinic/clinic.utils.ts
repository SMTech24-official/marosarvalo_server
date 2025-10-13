import { AppointmentStatus } from "@prisma/client";
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

type Receipt = {
    createdAt: Date;
    paid: number;
};

type WeekStat = {
    label: string;
    value: number;
};

export const getWeeklyStats = (receipts: Receipt[]): WeekStat[] => {
    if (!receipts.length) return [];

    // Map week number to sum of 'paid'
    const weekMap = new Map<number, number>();

    receipts.forEach((r) => {
        const day = r.createdAt.getDate(); // 1..31
        const week = Math.ceil(day / 7); // week 1..5
        weekMap.set(week, (weekMap.get(week) || 0) + r.paid);
    });

    // Convert to {label, value} array
    const result: WeekStat[] = [];
    for (let i = 1; i <= 5; i++) {
        if (weekMap.has(i)) {
            result.push({
                label: `Week ${i}`,
                value: weekMap.get(i)!,
            });
        }
    }

    return result;
};

type AttendanceStats = {
    attended: number;
    missed: number;
};

export const getAttendanceStats = (
    appointments: {
        status: AppointmentStatus;
    }[]
): AttendanceStats => {
    const stats: AttendanceStats = { attended: 0, missed: 0 };

    for (const appt of appointments) {
        if (appt.status === "COMPLETED") stats.attended++;
        if (appt.status === "MISSED") stats.missed++;
    }

    return stats;
};

type ServiceItem = {
    service: {
        id: string;
        name: string;
    };
};

type ServiceCount = {
    [name: string]: number;
};

export const countServices = (items: ServiceItem[]): ServiceCount => {
    return items.reduce((acc: ServiceCount, item) => {
        const name = item.service.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
};

// Get Clinic ID from user
export const getUserClinicId = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

    return userData?.clinicId ?? "";
};
