const Joi = require('joi');

const userValidation = {
    // Schema cho chức năng update user
    // CHỈ cho phép các trường cụ thể được update (Whitelist)
    updateUser: Joi.object({
        fullName: Joi.string().min(2).max(50),
        phone: Joi.string().pattern(/^[0-9]{10,11}$/),
        email: Joi.string().email(),
        address: Joi.string().max(255),
        avatar: Joi.string().uri(),

        // Tuyệt đối KHÔNG khai báo isAdmin, balance, isActive ở đây
        // Nếu client truyền lên, Joi sẽ báo lỗi hoặc lọc bỏ (tuỳ config)
    }),

    // Schema cho chức năng register
    register: Joi.object({
        fullName: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
        // Không có isActive, isAdmin
    })
};

module.exports = userValidation;
