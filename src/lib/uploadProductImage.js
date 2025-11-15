import { supabase } from './supabaseClient';

// Upload a product image directly to Supabase Storage and return its public URL
// - Validates bucket existence should be pre-created: `Ecommerce`
// - Stores files under: products/<unique-file-name>
export async function uploadProductImage(file) {
  if (!file) throw new Error('No file provided');

  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPEG and PNG files are allowed');
  }

  const ext = file.name.split('.').pop();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `products/${unique}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('Ecommerce').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('Ecommerce').getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Failed to retrieve public URL');
  }

  return data.publicUrl;
}
