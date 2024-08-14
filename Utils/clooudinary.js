const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload_file = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file,
            {
                resource_type: "auto",
                folder
            }, // Options go here
            (error, result) => { // Corrected to handle both error and result
                if (error) {
                    return reject(error); // Reject the promise with the error
                }
                resolve({
                    public_id: result.public_id,
                    url: result.url,
                });
            }
        );
    });
};


const delete_file = async (file) => {
    try {
        const res = await cloudinary.uploader.destroy(file);
        return res.result === "ok";
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return false;
    }
};

module.exports = {
    cloudinary,
    upload_file,
    delete_file
};
