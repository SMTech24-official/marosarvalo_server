type Slot = { date: Date; timeSlot: string };

export const getNewestDate = (slots: Slot[]): Slot | null => {
    if (slots.length === 0) return null;

    return slots.reduce((latest, current) => {
        // Parse start time from timeSlot, e.g. "09:00am - 10:00am"
        const [startTime] = current.timeSlot.split(" - ");
        const [hourMin, ampm] = [startTime.slice(0, -2), startTime.slice(-2)];
        let [hours, minutes] = hourMin.split(":").map(Number);

        if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
        if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;

        const currentDateTime = new Date(current.date);
        currentDateTime.setHours(hours, minutes, 0, 0);

        // Same for latest
        const [latestStartTime] = latest.timeSlot.split(" - ");
        const [latestHourMin, latestAmPm] = [
            latestStartTime.slice(0, -2),
            latestStartTime.slice(-2),
        ];
        let [latestHours, latestMinutes] = latestHourMin.split(":").map(Number);
        if (latestAmPm.toLowerCase() === "pm" && latestHours < 12)
            latestHours += 12;
        if (latestAmPm.toLowerCase() === "am" && latestHours === 12)
            latestHours = 0;

        const latestDateTime = new Date(latest.date);
        latestDateTime.setHours(latestHours, latestMinutes, 0, 0);

        return currentDateTime > latestDateTime ? current : latest;
    }, slots[0]);
};
