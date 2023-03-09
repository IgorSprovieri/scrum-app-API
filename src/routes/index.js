import { Router } from "express";
import userController from "../controllers/user";
import sessionController from "../controllers/session";
const router = new Router();

router.post("/user", userController.create);
router.post("/login", sessionController.login);

export default router;
