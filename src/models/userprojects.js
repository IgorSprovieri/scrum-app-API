"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userProjects extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.users, { foreignKey: "user_id", as: "user" });
      this.belongsTo(models.projects, {
        foreignKey: "project_id",
        as: "projects",
      });
    }
  }
  userProjects.init(
    {
      user_id: DataTypes.INTEGER,
      project_id: DataTypes.INTEGER,
      is_admin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "userProjects",
    }
  );
  return userProjects;
};
