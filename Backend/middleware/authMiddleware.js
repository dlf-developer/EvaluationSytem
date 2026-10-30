// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.header('Authorization').replace('Bearer ', '');
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No Authorization header, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (decoded?.id) {
            const user = await User.findById(decoded.id).select('isActive isDualRole access roles');
            if (user && user.isActive === false) {
                return res.status(403).json({
                    message: 'Your account is inactive. Please connect with the admin to activate your account.',
                    isInactive: true,
                });
            }
            const activeRoleHeader = req.header('x-active-role');
            const isDual =
                user?.isDualRole === true ||
                user?.isDualRole === 'true' ||
                (Array.isArray(user?.roles) && user.roles.includes('Observer') && user.roles.includes('Teacher'));
            if (isDual && activeRoleHeader && ['Teacher', 'Observer'].includes(activeRoleHeader)) {
                req.user.activeRole = activeRoleHeader;
            } else {
                req.user.activeRole = user?.access || decoded.access;
            }
        } else {
            req.user.activeRole = decoded.access;
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
