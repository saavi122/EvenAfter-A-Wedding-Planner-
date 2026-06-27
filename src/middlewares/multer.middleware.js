import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the upload directory exists locally
const uploadDir = "./src/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local disk storage settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Temp folder destination
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Prevent duplicate file name collisions by generating a unique timestamp suffix
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure file type validation filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/pdf"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG, WEBP, and PDF files are allowed!"), false);
    }
};

// Create the configured multer upload instance
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    },
    fileFilter: fileFilter
});
