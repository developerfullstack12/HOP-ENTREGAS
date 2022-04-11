'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Property_views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull:false,
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
    await queryInterface.dropTable('Property_views');
  }
};