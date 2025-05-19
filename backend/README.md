
# Binary Supermarket Backend API

This is the backend API for Binary Supermarket application. It provides RESTful endpoints for product management, user authentication, cart management, and purchase processing.

## Setup

1. Create a PostgreSQL database named `binary_supermarket`.
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Update database configuration in the `.env` file.
4. Run the server:
   ```
   npm run dev
   ```

## Initial Setup

To initialize the database with sample data, run:
```javascript
// In backend directory
const { sequelize } = require('./config/database');
const { seedDatabase } = require('./config/seed');

async function init() {
  try {
    await sequelize.sync({ force: true });
    await seedDatabase();
    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

init();
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Purchases
- `POST /api/purchases` - Create new purchase (checkout)
- `GET /api/purchases` - Get all user's purchases
- `GET /api/purchases/:id` - Get a single purchase
