import jwt from 'jsonwebtoken'

const ensureAuthenticated = (req, res, next) => {
    const auth = req.headers['token']
    if (!auth) {
        return res.status(403).json({
            message: "Unauthorized, reqire jwt token"
        })
    }
    try {
        const decoded = jwt.verify(auth, process.env.JWT_KEY)
        req.user = decoded
        next()
    } catch (err) {
        res.json({message: 'Unauthorized, jwt token is wrong or expired'})
    }
}

export default ensureAuthenticated