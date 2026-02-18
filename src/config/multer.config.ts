import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    // 1. Get extension and sanitize file name
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase() || "unknown";

    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");

    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;

    // 2. DYNAMIC FOLDER LOGIC
    // We categorize based on the file's mimetype (e.g., 'image/png' -> 'image')
    const fileCategory = file.mimetype.split("/")[0]; // returns 'image', 'video', 'application', etc.

    // Custom mapping for specific extensions if needed
    let folder = "others";
    if (fileCategory === "image") {
      folder = "images";
    } else if (fileCategory === "video") {
      folder = "videos";
    } else if (
      extension === "pdf" ||
      extension === "doc" ||
      extension === "docx"
    ) {
      folder = "documents";
    }

    return {
      folder: `ph-healthcare/${folder}`, // Organized under a main 'uploads' directory
      public_id: uniqueName,
      resource_type: "auto", // CRITICAL: Allows Cloudinary to handle non-image files
    };
  },
});

export const multerUpload = multer({ storage });
