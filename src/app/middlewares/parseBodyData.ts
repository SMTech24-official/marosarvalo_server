import { NextFunction, Request, Response } from "express";

export const parseBodyData = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                success: false,
                message: "Invalid JSON format in data",
            });
        }
    }
    next();
};
