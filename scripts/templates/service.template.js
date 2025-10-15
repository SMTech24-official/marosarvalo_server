const template = ({ pascal, camel, subdir = false }) => `import prisma from "${
    subdir ? "../../" : ""
}../../../shared/prisma";
import QueryBuilder from "${subdir ? "../../" : ""}../../../utils/queryBuilder";
import config from "${subdir ? "../../" : ""}../../../config";
import { Prisma } from "@prisma/client";


export default {};`;

export default template;
