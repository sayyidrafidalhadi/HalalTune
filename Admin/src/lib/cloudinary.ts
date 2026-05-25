export const uploadToCloudinary = async (file: File, resourceType: "auto" | "image" | "video" = "auto") => {
  // Use environment variables if present, otherwise fall back to provided defaults
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcidrwk1e';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'HalalTune';

  console.log("Cloudinary: Starting upload...", { resourceType, fileName: file.name, cloudName, uploadPreset });

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary Upload Error Response:", errorData);
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    console.log("Cloudinary: Upload successful!", data.secure_url);
    return data;
  } catch (error: any) {
    console.error("Cloudinary Fetch Exception:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("Failed to connect to Cloudinary. Ensure your Cloud Name is 'dcidrwk1e' and your Upload Preset 'HalalTune' is set to 'Unsigned' in Cloudinary Settings -> Upload.");
    }
    throw error;
  }
};
