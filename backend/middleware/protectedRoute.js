import jwt from 'jsonwebtoken';
import User from '../modules/user.model.js';

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                error: "Unauthorized: No Token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                error: "Invalid Token"
            });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                error: "User Not Found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Server Error"
        });
    }
};
