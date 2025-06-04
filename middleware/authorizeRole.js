const authorizeRole = (...allowedRole) => {

    return (req, res, next) => {
        if (!req.user || !allowedRole.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied : Insufficient Permission" })
        }

        next();
    }

}

model.exports = authorizeRole;