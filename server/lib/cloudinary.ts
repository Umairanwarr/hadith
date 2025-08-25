import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (
    localFilePath: string,
    resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
  ) => {
    try {
      if (!localFilePath) return null;
  
      // Force PDFs to use raw resource type
      if (localFilePath.toLowerCase().endsWith('.pdf')) {
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'raw',
          public_id: `pdf_${Date.now()}_${path.basename(localFilePath, '.pdf')}`,
        });
        return response;
      }
  
      // Default case
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
      });
      return response;
    } catch (error) {
      fs.unlinkSync(localFilePath);
      return null;
    }
  };
    
const deleteFromCloudinary = async(fileUrl: string) => {
    try {
        const response = await cloudinary.uploader.destroy(fileUrl, {
            resource_type: 'image'
        });
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const deleteVideoFromCloudinary = async(fileUrl: string) => {
    try {
        const response = await cloudinary.uploader.destroy(fileUrl, {
            resource_type: 'video'
        });
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
