import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Customer } from '../models/index.js';
import { authenticate } from '../middlewares/authMiddleware.js';



const router = express.Router();

// Register a new customer
router.post('/register', async (req, res) => {
  try {
    // Check if email already exists
    const existingCustomer = await Customer.findOne({ where: { email: req.body.email } });
     
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Create customer
    const customer = await Customer.create({
      firstName: req.body.firstName,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
      // By default, isAdmin is false
    });
    
    // Generate token
    const token = jwt.sign(
      { id: customer.id, email: customer.email, isAdmin: customer.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return customer data without password and token
    const { password, ...customerData } = customer.get();
    res.status(201).json({ ...customerData, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    
    // Find customer by email
    const customer = await Customer.findOne({ where: { email: req.body.email } });
    
    if (!customer) {
      console.log('No customer found with email:', req.body.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const validPassword = await bcrypt.compare(req.body.password, customer.password);
    
    if (!validPassword) {
      console.log('Invalid password for email:', req.body.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: customer.id, email: customer.email, isAdmin: customer.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return customer data without password and token
    const { password, ...customerData } = customer.get();
    console.log('Login successful for:', req.body.email);
    res.json({ ...customerData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  // req.customer is set by the authenticate middleware
  const { password, ...customerData } = req.customer.get();
  res.json(customerData);
});

export default router;
