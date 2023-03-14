import { projects, userProjects, users } from "../models";
import { object, string, number, date, InferType } from "yup";
import { User } from "./users";

export class UserProject {
  id;
  user_id;
  project_id;
  is_admin;

  constructor(data) {
    const { userId, projectId, isAdmin } = data;
    if (userId) {
      this.user_id = userId;
    }
    if (projectId) {
      this.project_id = projectId;
    }
    if (isAdmin) {
      this.is_admin = isAdmin;
    }
  }

  async getOnDB() {
    try {
      const result = userProjects.findOne({
        where: {
          user_id: this.user_id,
          project_id: this.project_id,
        },
      });
      this.id = result.id;
      this.is_admin = result.is_admin;
      return result;
    } catch (error) {
      return error;
    }
  }

  async createOnDB() {
    try {
      const newUserProject = userProjects.create({ ...this });
      this.id = newUserProject.id;
      return newUserProject;
    } catch (error) {
      return error;
    }
  }
}

class UserProjects extends UserProject {
  projects = [];

  async getOnDB() {
    try {
      const result = await userProjects.findAll({
        where: {
          user_id: this.user_id,
        },
        include: [
          {
            model: projects,
            as: "projects",
          },
        ],
      });

      result.forEach((element) => {
        this.projects.push({
          id: element.projects.id,
          project_name: element.projects.project_name,
          description: element.projects.description,
          createdAt: element.projects.createdAt,
          updatedAt: element.projects.updatedAt,
          is_admin: element.is_admin,
        });
      });
      return result;
    } catch (error) {
      return error;
    }
  }
}

class ProjectUsers extends UserProject {
  users = [];

  async getOnDB() {
    try {
      const result = await userProjects.findAll({
        where: {
          project_id: this.project_id,
        },
        include: [
          {
            model: users,
            as: "user",
          },
        ],
      });

      result.forEach((element) => {
        this.users.push({
          user_project_id: element.user.id,
          name: element.user.name,
          avatar_url: element.user.avatar_url,
          is_admin: element.is_admin,
        });
      });
      return result;
    } catch (error) {
      return error;
    }
  }
}

class Controller {
  async getUserProjects(req, res) {
    try {
      const { userId } = req;

      const userProjects = new UserProjects({ userId: userId });
      await userProjects.getOnDB();

      return res.status(200).json(userProjects);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async getProjectUsers(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req;

      const userproject = new UserProject({ userId: userId, projectId: id });

      if (!userproject) {
        return res.status(403).json({ error: "Acess Denied" });
      }

      const projectUsers = new ProjectUsers({ projectId: id });
      await projectUsers.getOnDB();

      return res.status(200).json(projectUsers);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new Controller();
