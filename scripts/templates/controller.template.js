const template = ({
    pascal,
    camel,
    subdir = false,
}) => `import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import catchAsync from "${subdir ? "../../" : ""}../../../shared/catchAsync";
import sendResponse from "${
    subdir ? "../../" : ""
}../../../shared/sendResponse";
import ${pascal}Services from "./${camel}.service";


export default {};`;

export default template;
