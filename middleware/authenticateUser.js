const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {

            return res.status(401).json({ message: "Access Denaied. No token provided" })

        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.SECRET_STR)

        req.user = decoded

    }
    catch (error) {

        return res.status(403).json({ message: "Invalid or expired Token", error: error.message })

    }

}

model.exports = authenticateUser;