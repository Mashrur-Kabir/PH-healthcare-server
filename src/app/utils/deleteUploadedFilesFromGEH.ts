/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (
  req: Request,
) => {
  try {
    const filesToDelete: string[] = [];

    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (
      req.files &&
      typeof req.files === "object" &&
      !Array.isArray(req.files)
    ) {
      // [ [{path : "rfrf"}] , [{}, {}]]
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          filesToDelete.push(file.path);
        }
      });
    }

    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => deleteFileFromCloudinary(url)),
      );
      console.log(
        `\nDeleted ${filesToDelete.length} uploaded file(s) from Cloudinary due to an error during request processing.\n`,
      );
    }
  } catch (error: any) {
    console.error(
      "Error deleting uploaded files from Global Error Handler",
      error,
    );
  }
};

/**
Scans the Request: It looks through req.file (single uploads) and req.files (multiple fields or arrays) to find Cloudinary URLs (the path property).
Collects URLs: it builds a list of every file that was just uploaded during this specific failed request.
Wipes the Files: It calls deleteFileFromCloudinary for every URL in that list simultaneously using Promise.all.
Prevents "Zombies": It ensures your Cloudinary storage doesn't get filled with "zombie" files—images that exist in the cloud but have no record in your database.
 */
