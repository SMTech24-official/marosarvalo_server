// Using date = Date obj and timeSlot = String -`hh:mmam - hh:mmam` , take the from and join with date, return a Date with the time
export const genStartTime = (date: Date, timeSlot: string) => {
    const [from,] = timeSlot.split(" - ");
    const [fromHour, fromMinute] = from.slice(0, -2).split(":");
    const fromAmPm = from.slice(-2);

    date.setHours(
        parseInt(fromHour) + (fromAmPm === "pm" && fromHour !== "12" ? 12 : 0),
        parseInt(fromMinute),
        0,
        0,
    );

    return date;
};
