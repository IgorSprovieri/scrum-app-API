import { projects, userProjects, users } from "../models";
import { object, string, number, date, InferType } from "yup";
import { User } from "./users";
import { UserProject } from "./usersProjects";

class Project {
  id;
  project_name;
  description;
  createdAt;
  updatedAt;

  constructor(data) {
    const { projectName, description } = data;
    if (projectName) {
      this.project_name = projectName;
    }
    if (description) {
      this.description = description;
    }
  }

  async createOnDB() {
    try {
      const newProject = await projects.create({ ...this });
      this.id = newProject.id;
      this.createdAt = newProject.createdAt;
      this.updatedAt = newProject.updatedAt;

      return newProject;
    } catch (error) {
      return error;
    }
  }
}

class Controller {
  async createProject(req, res) {
    try {
      const schema = object({
        projectName: string().required(),
        description: string().required(),
      });

      await schema.validate(req.body);

      const { projectName, description } = req.body;
      const { userId } = req;

      const user = new User({ id: userId });
      const userFound = await user.getOnDB();

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      const project = new Project({
        projectName: projectName,
        description: description,
      });

      const createProjectResult = await project.createOnDB();

      if (!createProjectResult) {
        return res.status(500).json({ error: "Project Not Created" });
      }

      const userProject = new UserProject({
        userId: user.id,
        projectId: project.id,
        isAdmin: true,
      });

      const createUserProjectResult = await userProject.createOnDB();

      if (!createUserProjectResult) {
        return res.status(500).json({ error: "Project Not Created" });
      }

      return res.status(201).json({
        project: {
          id: project.id,
          name: project.project_name,
          description: project.description,
          isAdmin: userProject.isAdmin,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new Controller();
