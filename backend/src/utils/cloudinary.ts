import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = (fileBuffer: Buffer): Promise<UploadApiResponse | null> => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            reject(new Error("No file buffer provided"));
            return;
        }

        // Create the upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: 'service_marketplace/avatars',
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                if (result) {
                    return resolve(result);
                }
            }
        );

        // Pipe the buffer into the stream
        uploadStream.end(fileBuffer);
    });
};