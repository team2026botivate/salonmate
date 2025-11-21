// uploadProductImage.js (improved logging)
import supabase from '@/dataBase/connectdb';

export async function uploadProductImage(file, onProgress) {
  if (!file) throw new Error('No file provided');

  // Accept jpg/jpeg/png
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPG and PNG images are allowed');
  }

  // ensure no leading slash and correct folder
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const folder = 'products/gallery';
  const filePath = `${folder}/${uniqueName}`; // <-- must match policy: products/gallery/...

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || supabaseAnon;

      const uploadUrl = `${supabaseUrl}/storage/v1/object/ecommerce_store/${encodeURIComponent(
        filePath
      )}?upsert=true`;

      const xhr = new XMLHttpRequest();
      const done = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && typeof onProgress === 'function') {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            onProgress(pct);
          }
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(null);
            } else {
              reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
            }
          }
        };
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('apikey', supabaseAnon || '');
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      await done;
    } catch (xhrErr) {
      // Fallback to supabase client upload (no progress events)
      const { error: uploadError } = await supabase.storage
        .from('ecommerce_store')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      if (typeof onProgress === 'function') onProgress(100);
    }

    const { data: publicData, error: publicError } = supabase.storage
      .from('ecommerce_store')
      .getPublicUrl(filePath);

    if (publicError) {
      console.error('[upload] getPublicUrl error:', publicError);
      throw publicError;
    }

    return publicData?.publicUrl;
  } catch (err) {
    console.error('[upload] error:', err);
    throw err;
  }
}
