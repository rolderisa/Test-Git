import jwt from 'jsonwebtoken';
import { Customer } from '../models/index.js';

const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find customer from token
    const customer = await Customer.findByPk(decoded.id);
    
    if (!customer) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Set customer on request object
    req.customer = customer;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export { authenticate };
