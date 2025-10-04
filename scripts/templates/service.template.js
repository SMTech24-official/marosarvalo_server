const template = ({
  pascal,
  camel,
}) => `import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import config from "../../../config";
import { Prisma } from "@prisma/client";


const get${pascal}s = async (query: Record<string, unknown>) => {
	const queryBuilder = new QueryBuilder(prisma.${camel}, query);
	const results = await queryBuilder
		.filter()
		.sort()
		.paginate()
		.fields()
		.execute();

	const pagination = await queryBuilder.countTotal();
	return { data: results, pagination };
};


export default {
	get${pascal}s
};`;

export default template;
