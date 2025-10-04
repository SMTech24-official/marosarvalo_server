const template = ({ pascal, camel }) => `
import { z } from "zod";

const create${pascal}Schema = z.object({
	
});
export type Create${pascal}Input = z.infer<typeof create${pascal}Schema>

const update${pascal}Schema = z.object({
	
});
export type Update${pascal}Input = z.infer<typeof update${pascal}Schema>


export default {
	create${pascal}Schema,
    update${pascal}Schema,
};

`;

export default template;
