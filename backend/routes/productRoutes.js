import express from 'express';

import { Product } from '../models/index.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - protected with authentication and admin middleware
router.use(authenticate);
router.use(isAdmin);

// Create a new product (admin only)
router.post('/', async (req, res) => {
  try {
    const { code, name, type, price, image } = req.body;
    
    // Validate required fields
    if (!code || !name || !type || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if product code already exists
    const existingProduct = await Product.findOne({ where: { code } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    
    const product = await Product.create({
      code,
      name,
      type,
      price,
      inDate: new Date(),
      image: image || 'https://placehold.co/300x300?text=Product+Image',
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { code, name, type, price, image } = req.body;
    
    // Find the product
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product code is being changed and already exists
    if (code !== product.code) {
      const existingProduct = await Product.findOne({ where: { code } });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product code already exists' });
      }
    }
    
    // Update product
    await product.update({
      code: code || product.code,
      name: name || product.name,
      type: type || product.type,
      price: price || product.price,
      image: image || product.image,
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Find the product
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete the product
    await product.destroy();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product quantity (admin only) - separate endpoint to manage inventory
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Find the product
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product quantity
    product.quantity = quantity;
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;