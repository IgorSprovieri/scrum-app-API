import { Router } from "express";
import userController from "../controllers/user";
const router = new Router();

router.post("/user", userController.post);

export default router;
