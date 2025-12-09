const { BadUserRequestError } = require('../core/error.response');
const modelUser = require('../models/users.model');

// Middleware kiểm tra quyền hạn dựa trên các trường được gửi lên
// role: 'admin' | 'user' - Role bắt buộc để được update các restrictedFields
// restrictedFields: array - Các trường nhạy cảm cần bảo vệ
const grantAccess = (role, restrictedFields = []) => {
    return async (req, res, next) => {
        try {
            // Lấy danh sách các trường user đang muốn update
            const updateFields = Object.keys(req.body);

            // Tìm các trường nhạy cảm có trong request
            const sensitiveFields = updateFields.filter(field => restrictedFields.includes(field));

            // Nếu không có trường nhạy cảm nào -> Cho qua
            if (sensitiveFields.length === 0) {
                return next();
            }
            // Nếu có trường nhạy cảm -> Kiểm tra Role
            const { id } = req.user; // req.user có từ middleware authUser
            const user = await modelUser.findById(id);

            if (!user) {
                throw new BadUserRequestError("Không tìm thấy người dùng");
            }
            // Logic kiểm tra quyền
            const isAdmin = user.isAdmin;

            if (role === 'admin' && !isAdmin) {
                throw new BadUserRequestError(`Bạn không có quyền cập nhật các trường: ${sensitiveFields.join(', ')}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = grantAccess;
