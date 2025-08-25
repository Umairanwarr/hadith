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
      if (!localFilePath) {
        console.log('❌ No local file path provided');
        return null;
      }
  
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Cloudinary environment variables not set:', {
          cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
          api_key: !!process.env.CLOUDINARY_API_KEY,
          api_secret: !!process.env.CLOUDINARY_API_SECRET
        });
        return null;
      }
  
      console.log('☁️ Cloudinary config check passed, uploading file:', localFilePath);
  
      // Force PDFs to use raw resource type
      if (localFilePath.toLowerCase().endsWith('.pdf')) {
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'raw',
          public_id: `pdf_${Date.now()}_${path.basename(localFilePath, '.pdf')}`,
        });
        console.log('✅ PDF uploaded to Cloudinary:', response.secure_url);
        return response;
      }
  
      // Default case
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
      });
      console.log('✅ File uploaded to Cloudinary:', response.secure_url);
      return response;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
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
