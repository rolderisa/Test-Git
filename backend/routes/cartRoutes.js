// cartRoutes.js (Backend - Express.js)

import express from 'express';
import { Cart, CartItem, Product } from '../models/index.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(authenticate);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    // Find or create a cart for the customer
    const [cart] = await Cart.findOrCreate({
      where: { customerId: req.customer.id },
    });

    // Get cart items with product details, but exclude price
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'code', 'image'], // Exclude 'price'
      }],
    });

    // Format cart items for response
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productCode: item.productCode,
      quantity: item.quantity,
      productName: item.productName,
      image: item.image,
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create a cart for the customer
    const [cart] = await Cart.findOrCreate({
      where: { customerId: req.customer.id },
    });

    // Check if item already in cart
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // Create new cart item and store product details directly
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        productCode: product.code,
        productName: product.name,
        image: product.image,
      });
    }

    // Return updated cart
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'code', 'image'], // Exclude 'price'
      }],
    });

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productCode: item.productCode,
      quantity: item.quantity,
      productName: item.productName,
      image: item.image,
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Find the cart
    const cart = await Cart.findOne({
      where: { customerId: req.customer.id },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and update the cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Return updated cart
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'code', 'image'], // Exclude 'price'
      }],
    });

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productCode: item.productCode,
      quantity: item.quantity,
      productName: item.productName,
      image: item.image,
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find the cart
    const cart = await Cart.findOne({
      where: { customerId: req.customer.id },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete the cart item
    await CartItem.destroy({
      where: { id: itemId, cartId: cart.id },
    });

    // Return updated cart
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'code', 'image'], // Exclude 'price'
      }],
    });

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productCode: item.productCode,
      quantity: item.quantity,
      productName: item.productName,
      image: item.image,
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    // Find the cart
    const cart = await Cart.findOne({
      where: { customerId: req.customer.id },
    });

    if (cart) {
      // Delete all cart items
      await CartItem.destroy({
        where: { cartId: cart.id },
      });
    }

    res.json([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
