const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite veritabanı bağlantısı
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Veritabanı tablolarını oluştur
db.serialize(() => {
  // Personnel tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS personnel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      startDate TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      serialNumber TEXT UNIQUE NOT NULL,
      purchaseDate TEXT NOT NULL,
      value REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vehicles tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      plate TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      inventoryItems TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Assignments tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      personnelId INTEGER NOT NULL,
      assignDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      inventoryItems TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
      FOREIGN KEY (personnelId) REFERENCES personnel (id)
    )
  `);

  // History tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      entityId INTEGER NOT NULL,
      changes TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      user TEXT DEFAULT 'System'
    )
  `);

  // Örnek veriler ekle
  db.get("SELECT COUNT(*) as count FROM personnel", (err, row) => {
    if (row.count === 0) {
      const samplePersonnel = [
        ['Ahmet', 'Yılmaz', 'ahmet.yilmaz@company.com', '0532-123-4567', 'IT', 'Yazılım Geliştirici', '2023-01-15'],
        ['Ayşe', 'Kaya', 'ayse.kaya@company.com', '0533-234-5678', 'İnsan Kaynakları', 'İK Uzmanı', '2023-02-01'],
        ['Mehmet', 'Demir', 'mehmet.demir@company.com', '0534-345-6789', 'Muhasebe', 'Mali Müşavir', '2023-03-10']
      ];

      samplePersonnel.forEach(person => {
        db.run(
          "INSERT INTO personnel (name, surname, email, phone, department, position, startDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
          person
        );
      });
    }
  });

  db.get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
    if (row.count === 0) {
      const sampleInventory = [
        ['Laptop', 'Bilgisayar', 'Dell', 'Latitude 5520', 'DL123456789', '2023-01-01', 15000],
        ['Yazıcı', 'Ofis Ekipmanı', 'HP', 'LaserJet Pro', 'HP987654321', '2023-01-15', 2500],
        ['Telefon', 'İletişim', 'Samsung', 'Galaxy S21', 'SM123456789', '2023-02-01', 8000]
      ];

      sampleInventory.forEach(item => {
        db.run(
          "INSERT INTO inventory (name, category, brand, model, serialNumber, purchaseDate, value) VALUES (?, ?, ?, ?, ?, ?, ?)",
          item
        );
      });
    }
  });

  db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
    if (row.count === 0) {
      const sampleVehicles = [
        ['Toyota', 'Corolla', 2022, '34 ABC 123', 'Otomobil', '[1]'],
        ['Ford', 'Transit', 2021, '06 XYZ 456', 'Kamyonet', '[2,3]'],
        ['Volkswagen', 'Crafter', 2023, '35 DEF 789', 'Kamyonet', '[]']
      ];

      sampleVehicles.forEach(vehicle => {
        db.run(
          "INSERT INTO vehicles (brand, model, year, plate, type, inventoryItems) VALUES (?, ?, ?, ?, ?, ?)",
          vehicle
        );
      });
    }
  });

  // Migration: assignments tablosuna inventoryItems sütunu ekle
  db.run("PRAGMA table_info(assignments)", (err, rows) => {
    if (err) {
      console.error('Error checking assignments table:', err);
      return;
    }
    
    // inventoryItems sütununun var olup olmadığını kontrol et
    db.all("PRAGMA table_info(assignments)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err);
        return;
      }
      
      const hasInventoryItems = columns.some(col => col.name === 'inventoryItems');
      
      if (!hasInventoryItems) {
        console.log('Adding inventoryItems column to assignments table...');
        db.run("ALTER TABLE assignments ADD COLUMN inventoryItems TEXT DEFAULT '[]'", (err) => {
          if (err) {
            console.error('Error adding inventoryItems column:', err);
          } else {
            console.log('Successfully added inventoryItems column to assignments table');
          }
        });
      }
    });
  });
});

// Yardımcı fonksiyonlar
const addToHistory = (type, entityId, changes, user = 'System') => {
  db.run(
    "INSERT INTO history (type, entityId, changes, user) VALUES (?, ?, ?, ?)",
    [type, entityId, JSON.stringify(changes), user]
  );
};

// Personnel API Routes
app.get('/api/personnel', (req, res) => {
  db.all("SELECT * FROM personnel ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/personnel', (req, res) => {
  const { name, surname, email, phone, department, position, startDate } = req.body;
  
  db.run(
    "INSERT INTO personnel (name, surname, email, phone, department, position, startDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, surname, email, phone, department, position, startDate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM personnel WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        addToHistory('personnel_create', this.lastID, req.body);
        res.json(row);
      });
    }
  );
});

app.put('/api/personnel/:id', (req, res) => {
  const { id } = req.params;
  const { name, surname, email, phone, department, position, startDate } = req.body;
  
  db.run(
    "UPDATE personnel SET name = ?, surname = ?, email = ?, phone = ?, department = ?, position = ?, startDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [name, surname, email, phone, department, position, startDate, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM personnel WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        addToHistory('personnel_update', id, req.body);
        res.json(row);
      });
    }
  );
});

app.delete('/api/personnel/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM personnel WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    addToHistory('personnel_delete', id, { deleted: true });
    res.json({ message: 'Personnel deleted successfully' });
  });
});

// Inventory API Routes
app.get('/api/inventory', (req, res) => {
  db.all("SELECT * FROM inventory ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/inventory', (req, res) => {
  const { name, category, brand, model, serialNumber, purchaseDate, value, quantity = 1 } = req.body;
  
  db.run(
    "INSERT INTO inventory (name, category, brand, model, serialNumber, purchaseDate, value, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, category, brand, model, serialNumber, purchaseDate, value, quantity],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM inventory WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        addToHistory('inventory_create', this.lastID, req.body);
        res.json(row);
      });
    }
  );
});

app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, brand, model, serialNumber, purchaseDate, value, quantity = 1 } = req.body;
  
  db.run(
    "UPDATE inventory SET name = ?, category = ?, brand = ?, model = ?, serialNumber = ?, purchaseDate = ?, value = ?, quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [name, category, brand, model, serialNumber, purchaseDate, value, quantity, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM inventory WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        addToHistory('inventory_update', id, req.body);
        res.json(row);
      });
    }
  );
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM inventory WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    addToHistory('inventory_delete', id, { deleted: true });
    res.json({ message: 'Inventory item deleted successfully' });
  });
});

// Vehicles API Routes
app.get('/api/vehicles', (req, res) => {
  db.all("SELECT * FROM vehicles ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // inventoryItems JSON string'ini array'e çevir
    const vehicles = rows.map(vehicle => ({
      ...vehicle,
      inventoryItems: JSON.parse(vehicle.inventoryItems || '[]')
    }));
    res.json(vehicles);
  });
});

app.post('/api/vehicles', (req, res) => {
  const { brand, model, year, plate, type, inventoryItems } = req.body;
  
  db.run(
    "INSERT INTO vehicles (brand, model, year, plate, type, inventoryItems) VALUES (?, ?, ?, ?, ?, ?)",
    [brand, model, year, plate, type, JSON.stringify(inventoryItems || [])],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM vehicles WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const vehicle = {
          ...row,
          inventoryItems: JSON.parse(row.inventoryItems || '[]')
        };
        addToHistory('vehicle_create', this.lastID, req.body);
        res.json(vehicle);
      });
    }
  );
});

app.put('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const { brand, model, year, plate, type, inventoryItems } = req.body;
  
  db.run(
    "UPDATE vehicles SET brand = ?, model = ?, year = ?, plate = ?, type = ?, inventoryItems = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [brand, model, year, plate, type, JSON.stringify(inventoryItems || []), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM vehicles WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const vehicle = {
          ...row,
          inventoryItems: JSON.parse(row.inventoryItems || '[]')
        };
        addToHistory('vehicle_update', id, req.body);
        res.json(vehicle);
      });
    }
  );
});

app.delete('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM vehicles WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    addToHistory('vehicle_delete', id, { deleted: true });
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

// Assignments API Routes
app.get('/api/assignments', (req, res) => {
  db.all("SELECT * FROM assignments ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // inventoryItems JSON string'ini parse et
    const assignments = rows.map(row => ({
      ...row,
      inventoryItems: JSON.parse(row.inventoryItems || '[]')
    }));
    res.json(assignments);
  });
});

app.post('/api/assignments', (req, res) => {
  const { vehicleId, personnelId, assignDate, status, notes } = req.body;
  
  // Önce aracın envanter öğelerini al
  db.get("SELECT inventoryItems FROM vehicles WHERE id = ?", [vehicleId], (err, vehicle) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const inventoryItems = vehicle ? JSON.parse(vehicle.inventoryItems || '[]') : [];
    
    db.run(
      "INSERT INTO assignments (vehicleId, personnelId, assignDate, status, notes, inventoryItems) VALUES (?, ?, ?, ?, ?, ?)",
      [vehicleId, personnelId, assignDate, status || 'active', notes, JSON.stringify(inventoryItems)],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM assignments WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const assignment = {
          ...row,
          inventoryItems: JSON.parse(row.inventoryItems || '[]')
        };
        addToHistory('assignment', this.lastID, req.body);
        res.json(assignment);
      });
    }
    );
  });
  
});

app.put('/api/assignments/:id', (req, res) => {
  const { id } = req.params;
  const { vehicleId, personnelId, assignDate, returnDate, status, notes } = req.body;
  
  db.run(
    "UPDATE assignments SET vehicleId = ?, personnelId = ?, assignDate = ?, returnDate = ?, status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [vehicleId, personnelId, assignDate, returnDate, status, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM assignments WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const assignment = {
          ...row,
          inventoryItems: JSON.parse(row.inventoryItems || '[]')
        };
        addToHistory('assignment_update', id, req.body);
        res.json(assignment);
      });
    }
  );
});

app.put('/api/assignments/:id/return', (req, res) => {
  const { id } = req.params;
  const { returnDate, notes } = req.body;
  
  db.run(
    "UPDATE assignments SET returnDate = ?, status = 'returned', notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [returnDate, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM assignments WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const assignment = {
          ...row,
          inventoryItems: JSON.parse(row.inventoryItems || '[]')
        };
        addToHistory('return', id, { returnDate, notes });
        res.json(assignment);
      });
    }
  );
});

// History API Routes
app.get('/api/history', (req, res) => {
  db.all("SELECT * FROM history ORDER BY date DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // changes JSON string'ini object'e çevir
    const history = rows.map(record => ({
      ...record,
      changes: JSON.parse(record.changes)
    }));
    res.json(history);
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('SQLite database initialized');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});