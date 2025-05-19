import express from 'express';
import {sequelize} from '../config/database.js';
import { Cart, CartItem, Purchase, PurchaseItem, Product, Customer } from '../models/index.js';
import { authenticate } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Apply authentication middleware to all purchase routes
router.use(authenticate);

// Create new purchase (checkout)
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    // Find customer's cart
    const cart = await Cart.findOne({
      where: { customerId: req.customer.id },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
    });
    
    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total
    let total = 0;
    for (const item of cart.CartItems) {
      total += item.quantity * parseFloat(item.Product.price);
    }
    
    // Create purchase
    const purchase = await Purchase.create(
      {
        customerId: req.customer.id,
        date: new Date(),
        total,
      },
      { transaction: t }
    );
    
    // Create purchase items
    const purchaseItems = [];
    for (const item of cart.CartItems) {
      const purchaseItem = await PurchaseItem.create(
        {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: parseFloat(item.Product.price),
        },
        { transaction: t }
      );
      purchaseItems.push(purchaseItem);
    }
    
    // Clear cart
    await CartItem.destroy(
      {
        where: { cartId: cart.id },
      },
      { transaction: t }
    );
    
    await t.commit();
    
    // Fetch customer name
    const customer = await Customer.findByPk(req.customer.id);
    
    // Format response
    const formattedPurchase = {
      id: purchase.id,
      customerId: purchase.customerId,
      customerName: customer.firstName,
      date: purchase.date,
      items: await Promise.all(
        purchaseItems.map(async (item) => {
          const product = await Product.findByPk(item.productId);
          return {
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            total: item.quantity * parseFloat(item.unitPrice),
          };
        })
      ),
      total: parseFloat(purchase.total),
    };
    
    res.status(201).json(formattedPurchase);
  } catch (error) {
    await t.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Checkout failed' });
  }
});

// Get all purchases for current user
router.get('/', async (req, res) => {
  try {
    // Get all purchases
    const purchases = await Purchase.findAll({
      where: { customerId: req.customer.id },
      order: [['date', 'DESC']],
    });
    
    // Format purchases with details
    const formattedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        // Get purchase items
        const items = await PurchaseItem.findAll({
          where: { purchaseId: purchase.id },
          include: [Product],
        });
        
        // Get customer
        const customer = await Customer.findByPk(purchase.customerId);
        
        return {
          id: purchase.id,
          customerId: purchase.customerId,
          customerName: customer.firstName,
          date: purchase.date,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.Product.name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            total: item.quantity * parseFloat(item.unitPrice),
          })),
          total: parseFloat(purchase.total),
        };
      })
    );
    
    res.json(formattedPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single purchase
router.get('/:id', async (req, res) => {
  try {
    // Find purchase
    const purchase = await Purchase.findOne({
      where: {
        id: req.params.id,
        customerId: req.customer.id,
      },
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Get purchase items
    const items = await PurchaseItem.findAll({
      where: { purchaseId: purchase.id },
      include: [Product],
    });
    
    // Get customer
    const customer = await Customer.findByPk(purchase.customerId);
    
    // Format response
    const formattedPurchase = {
      id: purchase.id,
      customerId: purchase.customerId,
      customerName: customer.firstName,
      date: purchase.date,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.Product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        total: item.quantity * parseFloat(item.unitPrice),
      })),
      total: parseFloat(purchase.total),
    };
    
    res.json(formattedPurchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
