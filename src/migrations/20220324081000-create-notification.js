'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(40),
        allowNull:false
      },
      message: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      is_read:{
        type: Sequelize.INTEGER,
        defaultValue:1,
        comment: '0:READ,1:NOT_READ',
      },
      sender_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      receiver_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '1:ACTIVE,2:INACTIVE,3:DELETE',
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
    await queryInterface.dropTable('notification');
  }
};