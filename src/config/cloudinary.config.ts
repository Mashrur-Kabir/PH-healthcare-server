import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import { AppError } from "../app/error/AppError";
import status from "http-status";

cloudinary.config({
  secure: true,
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(status.BAD_REQUEST, "File buffer and name are required");
  }

  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const cleanedName = parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");

  // FIX 1: Keep the extension in the public_id so the URL ends in .pdf
  const uniqueName = `${Math.random().toString(36).substring(2, 8)}-${Date.now()}-${cleanedName}.${extension}`;
  const folderPath = `ph-healthcare/${extension === "pdf" ? "pdfs" : "images"}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // FIX 2: Explicitly set "image" for PDFs to allow browser viewing
        resource_type: "auto",
        public_id: uniqueName,
        folder: folderPath,
      },
      (error, result) => {
        if (error)
          return reject(
            new AppError(
              status.INTERNAL_SERVER_ERROR,
              "Cloudinary upload failed",
            ),
          );
        resolve(result as UploadApiResponse);
      },
    );

    uploadStream.on("error", (err) => {
      reject(
        new AppError(
          status.INTERNAL_SERVER_ERROR,
          `Stream Error: ${err.message}`,
        ),
      );
    });

    uploadStream.end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    // 1. Improved regex to capture the publicId and extension
    const regex = /\/v\d+\/(.+?)\.([a-zA-Z0-9]+)$/;
    const match = url.match(regex);

    if (match && match[1]) {
      const publicId = match[1];
      const extension = match[2].toLowerCase();

      // 2. Determine resource_type dynamically
      let resourceType: "image" | "video" | "raw" = "image";

      if (["mp4", "mov", "avi"].includes(extension)) {
        resourceType = "video";
      } else if (["pdf", "doc", "docx", "txt", "zip"].includes(extension)) {
        // Cloudinary treats non-media files like PDFs and Docs as "raw"
        resourceType = "raw";
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === "not found") {
        console.warn(
          `File ${publicId} not found on Cloudinary with resource_type: ${resourceType}`,
        );
      } else {
        console.log(
          `File ${publicId} (${resourceType}) deleted from Cloudinary`,
        );
      }
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to delete file from Cloudinary",
    );
  }
};

export const cloudinaryUpload = cloudinary;
