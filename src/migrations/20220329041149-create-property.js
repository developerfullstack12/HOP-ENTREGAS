'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      address: {
        type: Sequelize.STRING(100),
      },
      category: {
        type: Sequelize.STRING(100),
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull:false
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull:false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      description: {
        type: Sequelize.STRING(200),
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment:  '1:ACTIVE,2:INACTIVE,3:DELETE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('properties');
  }
};