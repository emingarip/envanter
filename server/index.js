const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Veritabanı tablolarını oluştur
const initDatabase = async () => {
  try {
    // Personnel tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personnel (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        department VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inventory tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) UNIQUE NOT NULL,
        purchase_date DATE NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicles tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        plate VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(255) NOT NULL,
        inventory_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assignments tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        personnel_id INTEGER NOT NULL REFERENCES personnel(id),
        assign_date DATE NOT NULL,
        return_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        inventory_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // History tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        entity_id INTEGER NOT NULL,
        changes JSONB NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_name VARCHAR(255) DEFAULT 'System'
      )
    `);

    // Örnek veriler ekle
    const personnelCount = await pool.query("SELECT COUNT(*) FROM personnel");
    if (parseInt(personnelCount.rows[0].count) === 0) {
      const samplePersonnel = [
        ['Ahmet', 'Yılmaz', 'ahmet.yilmaz@company.com', '0532-123-4567', 'IT', 'Yazılım Geliştirici', '2023-01-15'],
        ['Ayşe', 'Kaya', 'ayse.kaya@company.com', '0533-234-5678', 'İnsan Kaynakları', 'İK Uzmanı', '2023-02-01'],
        ['Mehmet', 'Demir', 'mehmet.demir@company.com', '0534-345-6789', 'Muhasebe', 'Mali Müşavir', '2023-03-10']
      ];

      for (const person of samplePersonnel) {
        await pool.query(
          "INSERT INTO personnel (name, surname, email, phone, department, position, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          person
        );
      }
    }

    const inventoryCount = await pool.query("SELECT COUNT(*) FROM inventory");
    if (parseInt(inventoryCount.rows[0].count) === 0) {
      const sampleInventory = [
        ['Laptop', 'Bilgisayar', 'Dell', 'Latitude 5520', 'DL123456789', '2023-01-01', 15000],
        ['Yazıcı', 'Ofis Ekipmanı', 'HP', 'LaserJet Pro', 'HP987654321', '2023-01-15', 2500],
        ['Telefon', 'İletişim', 'Samsung', 'Galaxy S21', 'SM123456789', '2023-02-01', 8000]
      ];

      for (const item of sampleInventory) {
        await pool.query(
          "INSERT INTO inventory (name, category, brand, model, serial_number, purchase_date, value) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          item
        );
      }
    }

    const vehicleCount = await pool.query("SELECT COUNT(*) FROM vehicles");
    if (parseInt(vehicleCount.rows[0].count) === 0) {
      const sampleVehicles = [
        ['Toyota', 'Corolla', 2022, '34 ABC 123', 'Otomobil', '[1]'],
        ['Ford', 'Transit', 2021, '06 XYZ 456', 'Kamyonet', '[2,3]'],
        ['Volkswagen', 'Crafter', 2023, '35 DEF 789', 'Kamyonet', '[]']
      ];

      for (const vehicle of sampleVehicles) {
        await pool.query(
          "INSERT INTO vehicles (brand, model, year, plate, type, inventory_items) VALUES ($1, $2, $3, $4, $5, $6)",
          vehicle
        );
      }
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Yardımcı fonksiyonlar
const addToHistory = async (type, entityId, changes, user = 'System') => {
  try {
    await pool.query(
      "INSERT INTO history (type, entity_id, changes, user_name) VALUES ($1, $2, $3, $4)",
      [type, entityId, JSON.stringify(changes), user]
    );
  } catch (err) {
    console.error('Error adding to history:', err);
  }
};

// Personnel API Routes
app.get('/api/personnel', async (req, res) => {
  try {
    const result = await pool.query("SELECT *, start_date as \"startDate\", created_at as \"createdAt\", updated_at as \"updatedAt\" FROM personnel ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/personnel', async (req, res) => {
  const { name, surname, email, phone, department, position, startDate } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO personnel (name, surname, email, phone, department, position, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *, start_date as \"startDate\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [name, surname, email, phone, department, position, startDate]
    );
    
    await addToHistory('personnel_create', result.rows[0].id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/personnel/:id', async (req, res) => {
  const { id } = req.params;
  const { name, surname, email, phone, department, position, startDate } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE personnel SET name = $1, surname = $2, email = $3, phone = $4, department = $5, position = $6, start_date = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *, start_date as \"startDate\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [name, surname, email, phone, department, position, startDate, id]
    );
    
    await addToHistory('personnel_update', id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/personnel/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM personnel WHERE id = $1", [id]);
    await addToHistory('personnel_delete', id, { deleted: true });
    res.json({ message: 'Personnel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory API Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query("SELECT *, serial_number as \"serialNumber\", purchase_date as \"purchaseDate\", created_at as \"createdAt\", updated_at as \"updatedAt\" FROM inventory ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { name, category, brand, model, serialNumber, purchaseDate, value, quantity = 1 } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO inventory (name, category, brand, model, serial_number, purchase_date, value, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, serial_number as \"serialNumber\", purchase_date as \"purchaseDate\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [name, category, brand, model, serialNumber, purchaseDate, value, quantity]
    );
    
    await addToHistory('inventory_create', result.rows[0].id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, brand, model, serialNumber, purchaseDate, value, quantity = 1 } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE inventory SET name = $1, category = $2, brand = $3, model = $4, serial_number = $5, purchase_date = $6, value = $7, quantity = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *, serial_number as \"serialNumber\", purchase_date as \"purchaseDate\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [name, category, brand, model, serialNumber, purchaseDate, value, quantity, id]
    );
    
    await addToHistory('inventory_update', id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
    await addToHistory('inventory_delete', id, { deleted: true });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles API Routes
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query("SELECT *, inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\" FROM vehicles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const { brand, model, year, plate, type, inventoryItems } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO vehicles (brand, model, year, plate, type, inventory_items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *, inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [brand, model, year, plate, type, JSON.stringify(inventoryItems || [])]
    );
    
    await addToHistory('vehicle_create', result.rows[0].id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { brand, model, year, plate, type, inventoryItems } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE vehicles SET brand = $1, model = $2, year = $3, plate = $4, type = $5, inventory_items = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *, inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [brand, model, year, plate, type, JSON.stringify(inventoryItems || []), id]
    );
    
    await addToHistory('vehicle_update', id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM vehicles WHERE id = $1", [id]);
    await addToHistory('vehicle_delete', id, { deleted: true });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assignments API Routes
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await pool.query("SELECT *, vehicle_id as \"vehicleId\", personnel_id as \"personnelId\", assign_date as \"assignDate\", return_date as \"returnDate\", inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\" FROM assignments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  const { vehicleId, personnelId, assignDate, inventoryItems } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO assignments (vehicle_id, personnel_id, assign_date, inventory_items) VALUES ($1, $2, $3, $4) RETURNING *, vehicle_id as \"vehicleId\", personnel_id as \"personnelId\", assign_date as \"assignDate\", return_date as \"returnDate\", inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [vehicleId, personnelId, assignDate, JSON.stringify(inventoryItems || [])]
    );
    
    await addToHistory('assignment_create', result.rows[0].id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/assignments/:id/return', async (req, res) => {
  const { id } = req.params;
  const { returnDate, notes } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE assignments SET return_date = $1, status = 'returned', notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *, vehicle_id as \"vehicleId\", personnel_id as \"personnelId\", assign_date as \"assignDate\", return_date as \"returnDate\", inventory_items as \"inventoryItems\", created_at as \"createdAt\", updated_at as \"updatedAt\"",
      [returnDate, notes, id]
    );
    
    await addToHistory('assignment_return', id, { returnDate, notes });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// History API Routes
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query("SELECT *, entity_id as \"entityId\", user_name as \"user\" FROM history ORDER BY date DESC LIMIT 100");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});