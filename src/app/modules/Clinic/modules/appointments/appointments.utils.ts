import { format, getWeek, getYear } from "date-fns";

type FilterBy = "day" | "week" | "month" | "year" | undefined;

interface GroupedResult {
    label: string;
    total: number;
}

export const groupAppointment = (
    data: {
        date: Date;
    }[],
    filterBy: FilterBy,
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
            (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime(),
        );
};

type Appointment = {
    date: Date;
    startTime: Date;
    endTime: Date;
};

type Slot = {
    start: Date;
    end: Date;
    available: boolean;
};

export const createSlots = (
    startTime: Date,
    endTime: Date,
    length: number,
    appointments: Appointment[],
): Slot[] => {
    const slots: Slot[] = [];

    // helper: convert Date to minutes since midnight
    const minutes = (d: Date) => d.getHours() * 60 + d.getMinutes();

    // preprocess appointments into minutes
    const appIntervals = appointments.map((app) => ({
        start: minutes(app.startTime),
        end: minutes(app.endTime),
    }));

    let slotStart = new Date(startTime);

    while (slotStart < endTime) {
        const slotEnd = new Date(slotStart.getTime() + length * 60 * 1000);
        if (slotEnd > endTime) break;

        const slotStartMin = minutes(slotStart);
        const slotEndMin = minutes(slotEnd);

        const booked = appIntervals.some(
            (app) => app.start < slotEndMin && app.end > slotStartMin,
        );

        slots.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
            available: !booked,
        });

        slotStart = slotEnd;
    }

    return slots;
};
