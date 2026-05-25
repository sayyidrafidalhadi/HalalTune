export const uploadToCloudinary = async (file: File, resourceType: "auto" | "image" | "video" = "auto") => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcidrwk1e';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'HalalTune';

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  console.log("Cloudinary: Attempting upload to:", url);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown Cloudinary Error" } }));
      console.error("Cloudinary Error Response:", errorData);
      throw new Error(errorData.error?.message || "Cloudinary Upload Failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Cloudinary Fetch Error:", error);
    
    // Check for "Failed to fetch" which is usually a network/CORS issue
    if (error.message === "Failed to fetch") {
      throw new Error(
        `Network Error: Failed to connect to Cloudinary. 
        Possible causes:
        1. Cloud Name '${cloudName}' is wrong (check if it's 'dcidrwk1e' with a 1 or 'dcidrwkle' with an L).
        2. Ad-blocker is blocking api.cloudinary.com.
        3. Upload Preset '${uploadPreset}' is not set to 'Unsigned'.
        
        Check the Browser Console (F12) for the red network error.`
      );
    }
    throw error;
  }
};
