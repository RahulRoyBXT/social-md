import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUploader = async (localFilePath)=> {
    try{
        if(!localFilePath) return null
        // upload
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        await fs.unlink(localFilePath, (error)=> {
            if(error) throw error
            console.log('File was deleted')
        })
        return response
    } catch (error){
        fs.unlinkSync(localFilePath) // Removes if failed
    }
    
}

export const deleteFile = async (public_id)=> {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        
        console.error("Error deleting image:", error);
      } else {
        console.log("Image deleted:", result);
      }
    });
} 

export {cloudinaryUploader}