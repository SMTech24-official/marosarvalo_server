const template = ({
    pascal,
    camel,
}) => `import type { Request, Response } from "express"
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ${pascal}Services from "./${camel}.service";


const get${pascal}s = catchAsync(async (req: Request, res: Response) => {
	const result = await ${pascal}Services.get${pascal}s(req.query);
	
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "${pascal}s retrieved successfully",
		data: result.data,
		pagination: result.pagination,
	});
});

export default {
	get${pascal}s,
};`;

export default template;
