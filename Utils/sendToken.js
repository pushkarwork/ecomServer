module.exports = (user, statusCode, res) => {
    const token = user.generateJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'PRODUCTION', 
        sameSite: 'None'
        // secure: false
    }
    console.log("here in sendTOken",token)
    res.status(statusCode).cookie("token", token, options).json({ token })
        console.log("here in sendTOken",token,cookie)
}
