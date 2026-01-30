import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from '../lib/middleware.js';

// Configuration Supabase - NEVER hardcode keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL ERROR: Supabase credentials missing!');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Create Supabase client
console.log('[api/products] Creating Supabase client...');
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
console.log('[api/products] Supabase client created:', supabase ? '✓' : '✗ NULL');

export default async function handler(req, res) {
    // Configurer les headers CORS
    setCorsHeaders(res);

    // Gérer les requêtes OPTIONS
    if (handleCorsPreFlight(req, res)) {
        return;
    }

    if (req.method === 'GET') {
        try {
            const { data: products, error } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(products || []);
        } catch (error) {
            console.error('Fetch products error:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    } else if (req.method === 'POST') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const newProduct = req.body;

            // Validation des données requises
            if (!newProduct.name || typeof newProduct.name !== 'string') {
                return res.status(400).json({ error: 'Le nom du produit est requis et doit être une chaîne' });
            }
            if (!newProduct.price || typeof newProduct.price !== 'number' || newProduct.price < 0) {
                return res.status(400).json({ error: 'Le prix doit être un nombre positif' });
            }
            if (newProduct.category && typeof newProduct.category !== 'string') {
                return res.status(400).json({ error: 'La catégorie doit être une chaîne' });
            }

            // Normaliser les données (camelCase -> snake_case pour Supabase)
            const productToInsert = {
                name: newProduct.name,
                price: newProduct.price,
                promo_price: newProduct.promo_price || newProduct.promoPrice || null,
                image: newProduct.image || null,
                category: newProduct.category || null,
                tags: Array.isArray(newProduct.tags) ? newProduct.tags : (newProduct.tags ? [newProduct.tags] : []),
                is_featured: newProduct.is_featured ?? newProduct.isFeatured ?? false,
                alert_message: newProduct.alert_message || newProduct.alertMessage || null,
                options: newProduct.options || [],
                description: newProduct.description || null,
                stock: newProduct.stock ?? null
            };

            console.log('Inserting product:', productToInsert);

            const { data, error } = await supabase
                .from('portfolio_products')
                .insert([productToInsert])
                .select();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Product inserted successfully:', data);

            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });

            if (fetchError) {
                console.error('Supabase fetch error:', fetchError);
                throw fetchError;
            }

            res.status(201).json(allProducts);
        } catch (error) {
            console.error('Add product error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'PUT') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const { id, ...updatedProduct } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'L\'ID du produit est requis' });
            }

            const numId = Number(id);
            if (isNaN(numId)) {
                return res.status(400).json({ error: 'L\'ID du produit doit être un nombre' });
            }

            // Normaliser les données (camelCase -> snake_case pour Supabase)
            const productToUpdate = {};
            
            // Mapper tous les champs possibles
            if (updatedProduct.name !== undefined) productToUpdate.name = updatedProduct.name;
            if (updatedProduct.price !== undefined) productToUpdate.price = updatedProduct.price;
            if (updatedProduct.promo_price !== undefined || updatedProduct.promoPrice !== undefined) {
                productToUpdate.promo_price = updatedProduct.promo_price ?? updatedProduct.promoPrice ?? null;
            }
            if (updatedProduct.image !== undefined) productToUpdate.image = updatedProduct.image;
            if (updatedProduct.category !== undefined) productToUpdate.category = updatedProduct.category;
            if (updatedProduct.tags !== undefined) {
                productToUpdate.tags = Array.isArray(updatedProduct.tags) ? updatedProduct.tags : [];
            }
            if (updatedProduct.is_featured !== undefined || updatedProduct.isFeatured !== undefined) {
                productToUpdate.is_featured = updatedProduct.is_featured ?? updatedProduct.isFeatured ?? false;
            }
            if (updatedProduct.alert_message !== undefined || updatedProduct.alertMessage !== undefined) {
                productToUpdate.alert_message = updatedProduct.alert_message ?? updatedProduct.alertMessage ?? null;
            }
            if (updatedProduct.options !== undefined) {
                productToUpdate.options = Array.isArray(updatedProduct.options) ? updatedProduct.options : [];
            }
            if (updatedProduct.description !== undefined) productToUpdate.description = updatedProduct.description;
            if (updatedProduct.stock !== undefined) productToUpdate.stock = updatedProduct.stock;

            console.log('Updating product:', numId, productToUpdate);

            const { data, error } = await supabase
                .from('portfolio_products')
                .update(productToUpdate)
                .eq('id', numId)
                .select();

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }

            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });

            if (fetchError) {
                console.error('Supabase fetch error:', fetchError);
                throw fetchError;
            }

            res.status(200).json(allProducts);
        } catch (error) {
            console.error('Update product error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'DELETE') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'L\'ID du produit est requis' });
            }

            const numId = Number(id);
            if (isNaN(numId)) {
                return res.status(400).json({ error: 'L\'ID du produit doit être un nombre' });
            }

            console.log('Deleting product:', numId);

            const { data, error } = await supabase
                .from('portfolio_products')
                .delete()
                .eq('id', numId);

            if (error) {
                console.error('Supabase delete error:', error);
                throw error;
            }

            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });

            if (fetchError) {
                console.error('Supabase fetch error:', fetchError);
                throw fetchError;
            }

            res.status(200).json(allProducts);
        } catch (error) {
            console.error('Delete product error:', error);
            handleError(res, error, 500);
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}