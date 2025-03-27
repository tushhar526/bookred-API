const joi = require("joi");

const userValidation = joi.object({
    username: joi.string()
        .min(3)
        .required()
        .messages({
            'string.base': 'Username should be a type of string',
            'string.min': 'Username should have at least 3 characters',
            'any.required': 'Username is required',
        }),

    password: joi.string()
        .pattern(
            new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$')
        )
        .min(12)
        .required()
        .messages({
            'string.base': 'Password should be a type of string',
            'string.min': 'Password should have at least 12 characters',
            'any.required': 'Password is required',
        }),
    email: joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.base': 'Email should be a type of string',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
});

const validateUser = (userData) => {
    const { error, value } = userValidation.validate(userData);
    if (error) {
        console.log("Error = ",error)
        return {
            isValid: false,
            message: error.details[0].message,

        };
    }
    return {
        isValid: true,
        message: 'Validation successful',
    };
};

module.exports = validateUser;

// const joi = require('joi');

// const userValidation = joi.object({
//   username: joi.string().min(3).required(),
//   password: joi.string()
//     .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$'))
//     .min(8)
//     .max(16)
//     .required(),
// });

// const data = {
//   username: 'vishireeds',
//   password: 'VishireeDs@26',
// };

// const { error } = userValidation.validate(data);
// console.log(error ? error.details : 'Valid data');
