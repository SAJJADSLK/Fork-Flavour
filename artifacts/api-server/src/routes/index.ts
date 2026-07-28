import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import recipesRouter from "./recipes.js";
import categoriesRouter from "./categories.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recipesRouter);
router.use(categoriesRouter);

export default router;
