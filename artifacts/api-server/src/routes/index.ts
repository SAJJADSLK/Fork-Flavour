import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recipesRouter from "./recipes";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recipesRouter);
router.use(categoriesRouter);

export default router;
