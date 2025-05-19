import { Customer } from '../models/index.js';


const isAdmin = async (req, res, next) => {
  try {
    // Check if the customer is already authenticated
    if (!req.customer) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if the customer is an admin
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer || !customer.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {isAdmin};
