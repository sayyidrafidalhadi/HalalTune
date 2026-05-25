export const uploadToCloudinary = async (file: File, resourceType: "auto" | "image" | "video" = "auto") => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  console.log("Cloudinary: Starting upload...", { resourceType, fileName: file.name });

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary Configuration Missing:", { cloudName, uploadPreset });
    throw new Error("Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  console.log("Cloudinary: Fetching URL:", url);

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
      throw new Error("Failed to connect to Cloudinary. This is often a CORS issue or an invalid Cloud Name. Check your Cloud Name and ensure your Upload Preset is set to 'Unsigned'.");
    }
    throw error;
  }
};
