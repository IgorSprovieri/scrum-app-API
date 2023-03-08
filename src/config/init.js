import { initProjects, projectsAssociations } from "../models/projects";
import { initSprints, sprintsAssociations } from "../models/sprints";
import { initTasks, tasksAssociations } from "../models/tasks";
import { initUsers, usersAssociations } from "../models/users";
import {
  initUsersProjects,
  usersProjectsAssociations,
} from "../models/usersprojects";

const createTables = async () => {
  await initUsers();
  await initProjects();
  await initUsersProjects();
  await initSprints();
  await initTasks();
  usersAssociations();
  projectsAssociations();
  usersProjectsAssociations();
  sprintsAssociations();
  tasksAssociations();
};

createTables();
