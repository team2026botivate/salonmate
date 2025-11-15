import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Server-side Supabase client using Service Role Key (do NOT expose to frontend)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Backend will not work correctly.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// POST /api/products/save
// Accepts: { products: [{ name, description, price, imageUrl }] }
router.post('/save', async (req, res) => {
  try {
    const { products } = req.body || {};
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products array is required' });
    }

    // Prepare rows; ensure fields map to DB columns
    const rows = products.map((p) => ({
      name: p.name || '',
      description: p.description || '',
      price: p.price ? Number(p.price) : null,
      image_url: p.imageUrl || null,
    }));

    const { data, error } = await supabase.from('products').insert(rows).select('*');
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Failed to save products', error: error.message });
    }

    return res.json({ success: true, count: data?.length || 0, products: data });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Save products error:', err);
    return res.status(500).json({ message: 'Server error', error: err?.message });
  }
});

export default router;
