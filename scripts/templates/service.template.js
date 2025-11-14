const template = ({ pascal, camel, subdir = false }) => `import prisma from "${
    subdir ? "../../" : ""
}../../../shared/prisma";
import QueryBuilder from "${subdir ? "../../" : ""}../../../utils/queryBuilder";
import { StatusCodes } from "http-status-codes"
import config from "${subdir ? "../../" : ""}../../../config";

export default {};`;

export default template;
