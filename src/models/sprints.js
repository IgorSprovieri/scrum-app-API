"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sprints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.projects, {
        foreignKey: "project_id",
        as: "project",
      });
    }
  }
  sprints.init(
    {
      project_id: DataTypes.INTEGER,
      sprint_name: DataTypes.STRING,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "sprints",
    }
  );
  return sprints;
};
