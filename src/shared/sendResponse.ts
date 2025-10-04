import { Response } from "express";

const sendResponse = <T>(
    res: Response,
    jsonData: {
        success: boolean;
        statusCode: number;
        message: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPage: number;
        };
        data?: T | null | undefined;
    }
) => {
    res.status(jsonData.statusCode).json({
        success: jsonData.success,
        statusCode: jsonData.statusCode,
        message: jsonData.message,
        pagination: jsonData.pagination || null || undefined,
        data: jsonData.data || null || undefined,
    });
};

export default sendResponse;
