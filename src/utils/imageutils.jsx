export const convertGoogleDriveImageUrl = (originalUrl) => {
    if (!originalUrl || typeof originalUrl !== "string") {
      return "";
    }
  
    if (!originalUrl.includes("drive.google.com")) {
      return originalUrl;
    }
  
    const fileIdMatch = originalUrl.match(/\/d\/([^/]+)|id=([^&]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] || fileIdMatch[2] : null;
  
    if (!fileId) return originalUrl;
  
    return [
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
      `https://drive.google.com/uc?id=${fileId}`,
      originalUrl,
    ];
  };
  
  export const validateImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: "Image must be under 5MB" };
    }
  
    if (!file.type.match("image.*")) {
      return { valid: false, error: "Please select an image file" };
    }
  
    return { valid: true };
  };
  
  export const generateInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "U";
  };