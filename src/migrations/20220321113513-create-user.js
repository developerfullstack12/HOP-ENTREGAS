module.exports = {
  up: async(queryInterface, Sequelize) => {
    await queryInterface
        .createTable('users', {
          id: {
            allowNull: false,  
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          profile_image: {
            allowNull: true,
            type: Sequelize.TEXT,
          },
          user_role_type: {
            type: Sequelize.INTEGER,
            comment:'1:CUSTOMER,2:HOST,3:PARTNER',
          },
          name: {
            allowNull: true,
            type: Sequelize.STRING(100),
          },
          email: {
            type: Sequelize.STRING(200),
            unique: true,
          },
          password: {
            allowNull: true,
            type: Sequelize.STRING(250),
          },
          contact_number: {
            allowNull: true,
            type: Sequelize.STRING(20),
          },
          gender: {
            type: Sequelize.STRING,
            comment: '1:MALE,2:FEMALE,3:OTHER',
          },
          dob: {
            type: Sequelize.DATE,
            format: 'DD-MM-YYYY',
            defaultValue: null,
          },
          pin_code: {
            allowNull: true,
            type: Sequelize.TEXT,
            defaultValue: null
          },
          city: {
            type: Sequelize.STRING(20),
              allowNull: false,
          },
          state: {
            type: Sequelize.STRING(50),
              allowNull: false,
          },
          country: {
            type: Sequelize.STRING(20),
              allowNull: false,
          },
          sign_up_type: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
            comment: '1-EMAIL, 2-FACEBOOK, 3-GOOGLE',
          },
          social_id: {
            allowNull: true,
            type: Sequelize.TEXT,
          },
          otp: {
            allowNull: true,
            type: Sequelize.INTEGER,
            defaultValue: null,
          },
          reset_token: {
            defaultValue: '',
            type: Sequelize.TEXT,
          },
          reset_expiry: {
            defaultValue: null,
            type: Sequelize.DATE,
          },
            verification_link: {
                type: Sequelize.STRING,
                defaultValue: ''
            },
            password_reset_token_expire_at: {
                type: Sequelize.DATE,
                defaultValue: null,
            },
          fcm_token: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          status: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
            comment:  '1:ACTIVE,2:INACTIVE,3:DELETE,4:UN_VERIFY',
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        })
  },
  down: async(queryInterface) => {
    await queryInterface.dropTable('users')
  },
}