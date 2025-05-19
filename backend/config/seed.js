
const bcrypt = require('bcrypt');
const { Customer, Product } = require('../models');

async function seedDatabase() {
  try {
    // Seed customers
    const hashedPassword = await bcrypt.hash('password123', 10);
    await Customer.create({
      firstName: 'John Doe',
      phone: '1234567890',
      email: 'john@example.com',
      password: hashedPassword,
    });
    
    // Seed products
    const products = [
      {
        code: "BG001",
        name: "Bag",
        type: "Accessory",
        price: 25000,
        inDate: "2023-01-01",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2hvcHBpbmclMjBiYWd8ZW58MHx8MHx8fDA%3D",
      },
      {
        code: "AP001",
        name: "Apple",
        type: "Fruit",
        price: 2000,
        inDate: "2023-05-20",
        image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwbGV8ZW58MHx8MHx8fDA%3D",
      },
      {
        code: "ML001",
        name: "Milk",
        type: "Dairy",
        price: 3500,
        inDate: "2023-06-15",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsa3xlbnwwfHwwfHx8MA%3D%3D",
      },
      {
        code: "BR001",
        name: "Bread",
        type: "Bakery",
        price: 2500,
        inDate: "2023-06-20",
        image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJyZWFkfGVufDB8fDB8fHww",
      },
      {
        code: "RC001",
        name: "Rice",
        type: "Grain",
        price: 10000,
        inDate: "2023-04-10",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmljZXxlbnwwfHwwfHx8MA%3D%3D",
      },
      {
        code: "CH001",
        name: "Chicken",
        type: "Meat",
        price: 15000,
        inDate: "2023-06-22",
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
      },
    ];
    
    await Product.bulkCreate(products);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = { seedDatabase };
