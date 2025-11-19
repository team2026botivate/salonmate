// uploadProductImage.js (improved logging)
import supabase from "@/dataBase/connectdb";

export async function uploadProductImage(file) {
  if (!file) throw new Error("No file provided");

  // Accept jpg/jpeg/png
  const validTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Only JPG and PNG images are allowed");
  }

  // ensure no leading slash and correct folder
  const ext = file.name.split(".").pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const folder = "products/gallery";
  const filePath = `${folder}/${uniqueName}`; // <-- must match policy: products/gallery/...

  try {
  
    const {  error: uploadError } = await supabase.storage
      .from("ecommerce_store")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

  
    if (uploadError) {
    
      if (uploadError.message && uploadError.message.toLowerCase().includes("row-level security")) {
        throw new Error("Upload blocked by RLS policy: " + (uploadError.message || "check storage policies"));
      }
      throw uploadError;
    }

    const { data: publicData, error: publicError } = supabase.storage
      .from("ecommerce_store")
      .getPublicUrl(filePath);

    if (publicError) {
      console.error("[upload] getPublicUrl error:", publicError);
      throw publicError;
    }

    return publicData?.publicUrl;
  } catch (err) {
    throw err;
  }
}
