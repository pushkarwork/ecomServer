module.exports = (user, statusCode, res) => {
    const token = user.generateJwtToken()

   const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true, // Enable this if your site is served over HTTPS
        sameSite: 'none', // Allow cross-origin cookies
        domain: 'https://ecomfrontend-3l60.onrender.com', // Set domain for cross-subdomain cookies
       
    };
    console.log("here in sendTOken",token)
    res.status(statusCode).json({ token })
       
}
