// Vercel serverless function olarak backend
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantısı (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ürünleri getir
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ürün ekle
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, quantity, unit_price, supplier, description } = req.body;
    
    const result = await pool.query(
      'INSERT INTO products (name, category, quantity, unit_price, supplier, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, category, quantity, unit_price, supplier, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ürün güncelle
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit_price, supplier, description } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, quantity = $3, unit_price = $4, supplier = $5, description = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, category, quantity, unit_price, supplier, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ürün sil
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stok hareketleri getir
app.get('/api/stock-movements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sm.*, p.name as product_name 
      FROM stock_movements sm 
      JOIN products p ON sm.product_id = p.id 
      ORDER BY sm.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stok hareketi ekle
app.post('/api/stock-movements', async (req, res) => {
  try {
    const { product_id, type, quantity, reason, reference_number } = req.body;
    
    // Transaction başlat
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Stok hareketi ekle
      const movementResult = await client.query(
        'INSERT INTO stock_movements (product_id, type, quantity, reason, reference_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [product_id, type, quantity, reason, reference_number]
      );
      
      // Ürün stokunu güncelle
      const stockChange = type === 'in' ? quantity : -quantity;
      await client.query(
        'UPDATE products SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [stockChange, product_id]
      );
      
      await client.query('COMMIT');
      res.status(201).json(movementResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vercel için export
module.exports = app;