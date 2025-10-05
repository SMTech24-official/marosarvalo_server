const template = ({ pascal, camel }) => `import { Router } from "express";
import ${pascal}Controllers from "./${camel}.controller";
import auth from "../../middlewares/auth";
import ${pascal}Validations from "./${camel}.validation";

const router = Router();


export const ${pascal}Routes = router;`;

export default template;
