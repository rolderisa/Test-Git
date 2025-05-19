import { sequelize } from '../config/database.js';
import { Customer } from '../models/index.js';
import bcrypt from 'bcrypt';

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Sync all models with the database (without force to preserve data)
    await sequelize.sync();

    console.log('Checking for isAdmin column in Customer table...');
    
    // Add isAdmin column if it doesn't exist
    await sequelize.query(
      `ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;`
    );

    // Verify the table structure
    const [columns] = await sequelize.query(
      `SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Customers';`
    );
    console.log('Customer columns:', columns);

    console.log('Database migration completed successfully.');
    
    // Check if admin user exists
    const adminExists = await Customer.findOne({ where: { isAdmin: true } });
    console.log('Admin exists:', adminExists);

    if (!adminExists) {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Using Sequelize create() method to handle timestamps automatically
      await Customer.create({
        firstName: 'Admin',
        phone: '1234567890',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('Default admin user created successfully:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists.');
    }

    // Clean up duplicate email constraints if they exist
    try {
      const [results] = await sequelize.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '"Customers"'::regclass
        AND conname LIKE 'Customers_email_key%'
        AND conname != 'Customers_email_key';
      `);
      
      for (const constraint of results) {
        console.log(`Removing duplicate constraint: ${constraint.conname}`);
        await sequelize.query(`
          ALTER TABLE "Customers" 
          DROP CONSTRAINT "${constraint.conname}";
        `);
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up duplicate constraints:', cleanupError.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateDatabase();