import { Router } from "express";
import userController from "../controllers/user";
import auth from "../middlewares/auth";
const router = new Router();

router.post("/user", userController.post);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

//----------------------- Autenticate Routes
router.use(auth);

router.get("/user", userController.get);
router.put("/user", userController.put);
router.delete("/user", userController.delete);

export default router;
