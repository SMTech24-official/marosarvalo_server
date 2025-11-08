import { AppointmentStatus } from "@prisma/client";

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
    }[],
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
        id: string | number;
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
