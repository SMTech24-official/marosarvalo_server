export const getCountdown = (
    targetDate?: Date
): { days: number; hours: number; minutes: number } | null => {
    if (!targetDate) return null;

    const now = new Date(); // system-local tz, same as target if target is Date
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return { days, hours, minutes };
};
