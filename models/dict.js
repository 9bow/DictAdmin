"use strict";

module.exports = (sequelize, DataTypes) => {
  var Dict = sequelize.define(
    "Dict",
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pos: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tf: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      timestamps: false,
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ["token", "pos"]
        }
      ]
    }
  );

  Dict.associate = function(models) {
    // models.Dict.belongsTo(models.User, {
    //   foreignKey: {
    //     allowNull: false
    //   }
    // });
  };

  return Dict;
};
