import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { SendReminderInput } from "./reminder.validation";
import emailSender from "../../../../../helpers/emailSender/emailSender";

// Send Reminder
const sendReminder = async (payload: SendReminderInput) => {
    await emailSender(payload.subject, payload.email, payload.message);

    const response = await prisma.adminReminder.create({
        data: {
            ...payload,
        },
    });

    return {
        message: "Mail Send successful",
        data: response,
    };
};

// Get all Reminders
const getReminders = async (query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder(prisma.adminReminder, query);

    const reminders = await queryBuilder
        .search(["email"])
        .paginate()
        .sort()
        .execute();

    const pagination = await queryBuilder.countTotal();

    return {
        message: "Sent Reminders parsed",
        data: reminders,
        pagination,
    };
};

export default {
    sendReminder,
    getReminders,
};
