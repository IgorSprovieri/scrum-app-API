import { Router } from "express";
import userController from "../controllers/user";
import sessionController from "../controllers/session";
import auth from "../middlewares/auth";
const router = new Router();

router.post("/user", userController.create);
router.post("/login", sessionController.login);

//----------------------- Autenticate Routes
router.use(auth);

router.get("/user", userController.get);
router.put("/user", userController.put);
router.delete("/user", userController.delete);

export default router;
