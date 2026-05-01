import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '', // Usually not used on client
  api_secret: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || '', // Usually not used on client
  secure: true,
});

export default cloudinary;
