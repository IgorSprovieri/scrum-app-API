import { Router } from "express";
import userController from "../controllers/users";
import projectController from "../controllers/projects";
import usersProjectsController from "../controllers/usersprojects";
import authMiddleware from "../middlewares/auth";
import userMiddleware from "../middlewares/user";
const router = new Router();

router.post("/user", userController.post);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

//----------------------- Autenticate Routes
router.use(authMiddleware.checkJWT);
router.use(userMiddleware.checkUser);

router.get("/user", userController.get);
router.put("/user", userController.put);
router.delete("/user", userController.delete);

router.post("/project", projectController.createProject);
router.get("/user-projects", usersProjectsController.getUserProjects);
router.get("/project-users/:id", usersProjectsController.getProjectUsers);
export default router;
