import express from 'express';
import { Op } from 'sequelize';
import { Customer, Product, Purchase, PurchaseItem } from '../models/index.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';


const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Get all customers (admin only)
router.get('/customers', async (req, res) => {
  try { 
    const customers = await Customer.findAll({
      attributes: { exclude: ['password'] },
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales report (admin only)
router.get('/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.date = {};
      
      if (startDate) {
        dateFilter.date[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        dateFilter.date[Op.lte] = new Date(endDate);
      }
    }
    
    const purchases = await Purchase.findAll({
      where: dateFilter,
      include: [
        {
          model: Customer,
          attributes: ['id', 'firstName', 'email', 'phone'],
        },
        {
          model: PurchaseItem,
          include: [Product],
        },
      ],
      order: [['date', 'DESC']],
    });
    
    // Format purchases for report
    const formattedPurchases = purchases.map((purchase) => ({
      id: purchase.id,
      date: purchase.date,
      customer: {
        id: purchase.Customer.id,
        name: purchase.Customer.firstName,
        email: purchase.Customer.email,
        phone: purchase.Customer.phone,
      },
      items: purchase.PurchaseItems.map((item) => ({
        productId: item.Product.id,
        productCode: item.Product.code,
        productName: item.Product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        total: item.quantity * parseFloat(item.unitPrice),
      })),
      total: parseFloat(purchase.total),
    }));
    
    res.json(formattedPurchases);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
