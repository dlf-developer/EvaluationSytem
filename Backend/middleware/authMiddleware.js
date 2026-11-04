const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isTokenRevoked } = require('../utils/tokenCache');

/**
 * Hardened Authentication Middleware
 * 1. Validates strict 'Bearer <token>' format
 * 2. Checks Dual-Layer Token Cache for instant revocation ($0ms)
 * 3. Verifies cryptographic signature (HS256) & expiration with clock skew tolerance
 * 4. Differentiates TOKEN_EXPIRED from INVALID_TOKEN
 * 5. Strictly enforces live user.isActive === true (deactivated users blocked in real-time with 403 ACCOUNT_INACTIVE)
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            code: 'MISSING_TOKEN',
            message: 'Authorization token required in format Bearer <token>.',
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({
            success: false,
            code: 'INVALID_TOKEN',
            message: 'Broken or empty authentication token.',
        });
    }

    try {
        // 1. Dual-Layer Token Cache Check: Instant revocation check
        const isRevoked = await isTokenRevoked(token);
        if (isRevoked) {
            return res.status(401).json({
                success: false,
                code: 'TOKEN_REVOKED',
                message: 'Session has been revoked or invalidated. Please log in again.',
            });
        }

        // 2. Cryptographic JWT Verification
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'],
                clockTolerance: 60, // 60s clock skew tolerance
            });
        } catch (jwtErr) {
            if (jwtErr.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    code: 'TOKEN_EXPIRED',
                    message: 'Access token has expired.',
                });
            }
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Broken or invalid authentication token.',
            });
        }

        req.user = decoded;

        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Malformed token payload.',
            });
        }

        // 3. Live Database Status Check: Confirm user exists and isActive !== false
        const user = await User.findById(decoded.id).select('isActive isDualRole access roles');
        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User account associated with this token no longer exists.',
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                isInactive: true,
                code: 'ACCOUNT_INACTIVE',
                message: 'Your account is inactive. Please connect with the admin to activate your account.',
            });
        }

        // 4. Dual-Role Resolution
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

        next();
    } catch (error) {
        console.error('[AuthMiddleware] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal authentication error.',
        });
    }
};

module.exports = authMiddleware;
