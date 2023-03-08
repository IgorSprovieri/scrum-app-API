"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.sprints, { foreignKey: "sprint_id", as: "sprint" });
      this.belongsTo(models.users, { foreignKey: "users_id", as: "user" });
    }
  }
  tasks.init(
    {
      sprint_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      task: DataTypes.STRING,
      checked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "tasks",
    }
  );
  return tasks;
};
