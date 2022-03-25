const { Op } = require('sequelize')
const path = require('path')
const fetch = require('node-fetch')
const bcrypt = require('bcrypt')
const fs = require('fs-extra')
const { User } = require('../models')
const Response = require('../handler/Response')
const Constants = require('./Constants')

module.exports = {
    AppName: 'HOP ENTREGAS',
    forgotTemplate: 'forgotPassword',
    userEmailVerification: 'userEmailVerification',
    // get cashback
    toUpperCase: (str) => {
        if (str.length > 0) {
            const newStr = str
                .toLowerCase()
                .replace(/_([a-z])/, (m) => m.toUpperCase())
                .replace(/_/, '')
            return str.charAt(0).toUpperCase() + newStr.slice(1)
        }
        return ''
    },

    /*** 
     * @description This function use for create validation unique key
     * @param apiTag
     * @param error
     * @returns {*}
     */
    validationMessageKey: (apiTag, error) => {
        let key = module.exports.toUpperCase(error.details[0].context.key)
        let type = error.details[0].type.split('.')
        type = module.exports.toUpperCase(type[1])
        key = apiTag + key + type
        return key
    },
    /**
     * @description This function use for create random password
     * @param length
     * @returns {*}
     */
    hashstring(length = 10) {
        var result = '';
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (let i = 0; i < length; i += 1) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        result += bcrypt.hashSync(result, 10);
        return result;
    },
    /**
     * @description This function use for create random number
     * @param length
     * @returns {*}
     */

    makeRandomNumber: (length) => {
        let result = ''
        const characters =
            '0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    },
    generateMobileOtp: async function(len, mobile) {
        if (process.env.GENERATE_AND_SEND_OTP === 'true') {
            let text = ''
            const possible = '0123456789'
            for (let i = 0; i < len; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length))
            }

            const mobileOtpExist = await User.findOne({
                where: {
                    mobile: mobile,
                    status: {
                        [Op.not]: Constants.DELETE,
                    },
                    otp: text,
                },
            }).then((mobileOtpExistData) => mobileOtpExistData)

            if (mobileOtpExist) {
                await this.generateMobileOtp(len, mobile)
            }
            return text
        } else {
            return 1234
        }
    },

    UserImageUpload: (req, res, imageName) => {
        const oldPath = req.files.image.path;
        const newPath = `${path.join(__dirname, '../public/assets/images/user')
        }/${imageName}`;
        const rawData = fs.readFileSync(oldPath);
        console.log(newPath);
        // eslint-disable-next-line consistent-return
        fs.writeFile(newPath, rawData, (err) => {
            if (err) {
                return Response.errorResponseData(res, res.__('somethingWentWrong'), 500);
            }
        });
    },
    mediaUrl: (folder, name) => {
        if (name && name !== '') {
            return `${process.env.APP_URL}/${folder}/${name}`;
        }
        return '';
    },
}