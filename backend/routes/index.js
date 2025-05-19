import express from 'express';
import productRoutes from './productRoutes.js';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import purchaseRoutes from './purchaseRoutes.js';
import adminRoutes from './adminRoutes.js';


const router = express.Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/admin', adminRoutes);

export default router;
