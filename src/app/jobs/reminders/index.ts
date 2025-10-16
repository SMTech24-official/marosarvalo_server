import { ReminderSchedule } from "@prisma/client";
import prisma from "../../../shared/prisma";
import {
    addMinutes,
    differenceInMinutes,
    endOfDay,
    format,
    startOfDay,
} from "date-fns";
import { genStartTime } from "./utils";

// Run the Timed Schedules, e.g. prior to x min of appointments
const runTimedSchedules = async (schedule: ReminderSchedule, delay: number) => {
    if (!schedule.prior) return;

    // So, from `time - 3 min` to `time - 3 min` - where delay = 3 * 2 = 6 min
    const appointmentDate = addMinutes(new Date(), schedule.prior);
    const dateStart = startOfDay(appointmentDate);
    const dateEnd = endOfDay(appointmentDate);

    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: dateStart,
                lte: dateEnd,
            },
            status: {
                not: "CANCELLED",
            },
        },
        include: {
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    contactPreferences: true,
                },
            },
        },
    });

    appointments.forEach((appointment) => {
        const startTime = genStartTime(appointment.date, appointment.timeSlot);
        const now = new Date();

        const diff = differenceInMinutes(startTime, now);
        if (!(diff >= -delay / 2 && diff <= delay / 2)) return;

        // Send Mail to Patient
        console.log(`
Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}
Time: ${startTime.toString()}
Send Reminder Via: ${schedule.communicationMethods
            .filter((method) =>
                appointment.patient.contactPreferences.includes(method),
            )
            .join(", ")}
Time Remaining: ${format(
            addMinutes(startOfDay(new Date()), schedule.prior!),
            "HH:mm",
        )}
`);
    });
};

// Run the Untimed Schedules, e.g. post appointments, missed appointments
const runUntimedSchedules = async (
    schedule: ReminderSchedule,
    delay: number,
) => {
    // Check if it's DAY type and it's not time to send it!
    if (schedule.scheduleType === "DAY") {
        const now = new Date();
        const minutesPassed = differenceInMinutes(now, startOfDay(now));
        if (minutesPassed > delay) return;
    }

    if (schedule.scheduleType === "DAY") {
        const dateStart = startOfDay(new Date());
        const dateEnd = endOfDay(new Date());

        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: dateStart,
                    lte: dateEnd,
                },
                status: {
                    not: "CANCELLED",
                },
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        contactPreferences: true,
                    },
                },
            },
        });

        appointments.forEach((appointment) => {
            const startTime = genStartTime(
                appointment.date,
                appointment.timeSlot,
            );

            // Send Mail and Stuff!
            console.log(`
Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}
Time: ${startTime.toString()}
Send Reminder Via: ${schedule.communicationMethods
                .filter((method) =>
                    appointment.patient.contactPreferences.includes(method),
                )
                .join(", ")}
Time Remaining: ${format(
                addMinutes(startOfDay(new Date()), schedule.prior!),
                "HH:mm",
            )}
`);
        });
    }
};

export const AutoReminder = async (delay: number = 6 * 60) => {
    const schedules = await prisma.reminderSchedule.findMany({
        where: {
            status: "ACTIVE",
        },
    });

    // Run for Each Schedule. The instances won't be awaited, all will be async.
    schedules.forEach((schedule) => {
        if (schedule.scheduleType === "TIMED") {
            runTimedSchedules(schedule, delay);
        } else {
            runUntimedSchedules(schedule, delay);
        }
    });
};
