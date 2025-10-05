const template = ({
    pascal,
    camel,
}) => `import type { Request, Response } from "express"
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ${pascal}Services from "./${camel}.service";


export default {};`;

export default template;
