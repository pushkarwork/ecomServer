module.exports = (user, statusCode, res) => {
    const token = user.generateJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'None'
        // secure: false
    }

    res.status(statusCode).cookie("token", token, options).json({ token })
}
