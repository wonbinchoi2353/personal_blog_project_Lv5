'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ UserInfos, Posts, Comments, Likes }) {
      // define association here
      this.hasOne(UserInfos, {
        foreignKey: 'userId',
        as: 'userInfos',
        onDelete: 'cascade',
        hooks: true,
      });
      this.hasMany(Posts, { foreignKey: 'userId', as: 'posts', onDelete: 'cascade', hooks: true });
      this.hasMany(Comments, {
        foreignKey: 'userId',
        as: 'comments',
        onDelete: 'cascade',
        hooks: true,
      });
    }
  }
  Users.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      nickname: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Users',
    }
  );
  return Users;
};
