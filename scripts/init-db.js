const { initDb } = require('../models');

async function initializeDatabase() {
  try {
    console.log('Initializing database connection and models...');
    await initDb();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();

