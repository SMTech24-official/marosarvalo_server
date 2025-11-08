type Appointment = {
    date: Date;
    startTime: Date;
    endTime: Date;
};
export const getNewestDate = (
    appointments: Appointment[],
): Appointment | null => {
    if (appointments.length === 0) return null;

    return appointments.reduce(
        (latest, current) =>
            current.startTime > latest.startTime ? current : latest,
        appointments[0],
    );
};
