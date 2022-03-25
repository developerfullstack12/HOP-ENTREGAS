const bcrypt = require('bcrypt');
const {Op} = require('sequelize')
const { Admin,User } = require('../../models');
const Constants = require('../../utility/Constants');

module.exports = {

    userResetPasswordPage: async (req, res) => {
        const currentTime = new Date();
        const getCurrentTime = currentTime.setMinutes(currentTime.getMinutes() + 0);
        User.findOne({
            where: {
                verification_link: req.query.token,
                status: Constants.ACTIVE,
                password_reset_token_expire_at: {
                    [Op.gt]: getCurrentTime
                }
            }
        }).then((user) => {
            console.log(user);
            if (user) {
                res.render('reset-password', { token: req.query.token });
            }
            else {
                res.render('message', { type: 'Error', message: res.locals.__('invalidResetToken'), status: 400 });
            }
        });
    },
    userResetPasswordAction: async (req, res) => {
        const { password, confirmPassword,token } = req.body;
        console.log('req.body', req.body)
        if (token && token !='') {
            if (password && confirmPassword && password !== '' && confirmPassword !== '') {
                if (password === confirmPassword) {
                    const reqParam = req.body;
                    const currentTime = new Date();
                    const getCurrentTime = currentTime.setMinutes(currentTime.getMinutes() + 0);
                    const updateObj = { verification_link: '' };
                    User.findOne({
                        where: {
                            verification_link:reqParam.token,
                            status: Constants.ACTIVE,
                            password_reset_token_expire_at: {
                                [Op.gt]: getCurrentTime
                            }
                        }
                    }).then((user) => {
                        if (user) {
                            bcrypt.compare(reqParam.password, user.password, (err, result) => {
                                if (err) {
                                    res.render('message', { type: 'Error', message: res.locals.__('globalError'), status: 400 });
                                }
                                if (result) {
                                    res.render('reset-password', {
                                        type: 'Error',
                                        message: res.locals.__('oldPasswordSame'),
                                        token: reqParam.token
                                    });
                                }
                                else {
                                    bcrypt.hash(reqParam.password, 10, (err1, hash) => {
                                        if (err1) {
                                            res.render('message', { type: 'Error', message: res.locals.__('globalError'), status: 400 });
                                        }
                                        updateObj.password = hash;
                                        User.update(updateObj,{
                                            where:{
                                                id:user.id
                                            }
                                        }).then((passwordUpdated) => {
                                            if (passwordUpdated) {
                                                res.render('message', {
                                                    type: 'Success',
                                                    message: res.locals.__('changePasswordSuccess'),
                                                    status: 200
                                                });
                                            }
                                            else {
                                                res.render('message', { type: 'Error', message: res.locals.__('expiredResetToken'), status: 400 });
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            res.render('message', { type: 'Error', message: res.locals.__('invalidResetToken'), status: 400 });
                        }
                    });
                }
                else {
                    res.render('reset-password', {
                        type: 'Error',
                        message: res.locals.__('passwordNotMatch'),
                        token: req.body.token
                    });
                }
            }
            else {
                res.render('reset-password', {
                    type: 'Error',
                    message: res.locals.__('allFieldsRequired'),
                    token: req.body.token
                });
            }
        }
        else {
            res.render('message', { type: 'Error', message: res.locals.__('invalidInput'), status: 400 });
        }
    },

    resetPasswordPage: async (req, res) => {
        console.log('jdbjcajc')
        const currentTime = new Date();
        const getCurrentTime = currentTime.setMinutes(currentTime.getMinutes() + 0);
        Admin.findOne({
            where: {
                verification_link: req.query.token,
                status: Constants.ACTIVE,
                password_reset_token_expire_at: {
                    [Op.gt]: getCurrentTime
                }
            }
        }).then((admin) => {
            console.log(admin);
            if (admin) {
                res.render('emails/admin/auth/reset-password', { token: req.query.token });
            }
            else {
                res.render('message', { type: 'Error', message: res.locals.__('invalidResetToken'), status: 400 });
            }
        });
    },
    resetPasswordAction: async (req, res) => {
        const { password, confirmPassword, token } = req.body;
        if (token && token !== '') {
            if (password && confirmPassword && password !== '' && confirmPassword !== '') {
                if (password === confirmPassword) {
                    const reqParam = req.body;
                    const currentTime = new Date();
                    const getCurrentTime = currentTime.setMinutes(currentTime.getMinutes() + 0);
                    const updateObj = { verification_link: '' };
                    Admin.findOne({
                        where: {
                            verification_link:reqParam.token,
                            status: Constants.ACTIVE,
                            password_reset_token_expire_at: {
                                [Op.gt]: getCurrentTime
                            }
                        }
                    }).then((admin) => {
                        if (admin) {
                            bcrypt.compare(reqParam.password, admin.password, (err, result) => {
                                if (err) {
                                    res.render('message', { type: 'Error', message: res.locals.__('globalError'), status: 400 });
                                }
                                if (result) {
                                    res.render('emails/admin/auth/reset-password', {
                                        type: 'Error',
                                        message: res.locals.__('oldPasswordSame'),
                                        token: reqParam.token
                                    });
                                }
                                else {
                                    bcrypt.hash(reqParam.password, 10, (err1, hash) => {
                                        if (err1) {
                                            res.render('message', { type: 'Error', message: res.locals.__('globalError'), status: 400 });
                                        }
                                        updateObj.password = hash;
                                        Admin.update(updateObj, {
                                            where: {
                                                id: admin.id
                                            }
                                        }).then((passwordUpdated) => {
                                            if (passwordUpdated) {
                                                res.render('message', {
                                                    type: 'Success',
                                                    message: res.locals.__('changePasswordSuccess'),
                                                    status: 200
                                                });
                                            }
                                            else {
                                                res.render('message', { type: 'Error', message: res.locals.__('expiredResetToken'), status: 400 });
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            res.render('message', { type: 'Error', message: res.locals.__('invalidResetToken'), status: 400 });
                        }
                    });
                }
                else {
                    res.render('emails/admin/auth/reset-password', {
                        type: 'Error',
                        message: res.locals.__('passwordNotMatch'),
                        token: req.body.token
                    });
                }
            }
            else {
                res.render('emails/admin/auth/reset-password', {
                    type: 'Error',
                    message: res.locals.__('allFieldsRequired'),
                    token: req.body.token
                });
            }
        }
        else {
            res.render('message', { type: 'Error', message: res.locals.__('invalidInput'), status: 400 });
        }
    },
};
