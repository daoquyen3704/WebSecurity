const { BadRequestError } = require('../core/error.response');

const validate = (schema) => (req, res, next) => {
    // validateAsync trả về value đã được làm sạch (nếu dùng stripUnknown cho schema global hoặc từng field)
    // Tuy nhiên, để Whitelist chặt chẽ, ta dùng option { stripUnknown: true }
    // -> Nó sẽ loại bỏ các field không khai báo trong schema khỏi req.body

    const { error, value } = schema.validate(req.body, {
        stripUnknown: true, // QUAN TRỌNG: Loại bỏ field thừa (Whitelist)
        abortEarly: false   // Báo tất cả lỗi
    });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new BadRequestError(errorMessage));
    }

    // Gán lại req.body bằng value đã được lọc sạch
    Object.assign(req.body, value);

    // Hoặc an toàn hơn: req.body = value;
    // Nhưng Object.assign giữ lại reference nếu có middleware khác dùng (ít khi)
    // Ở đây ta gán đè để đảm bảo các field thừa bị bay màu
    req.body = value;

    return next();
};

module.exports = validate;
