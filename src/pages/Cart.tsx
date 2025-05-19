
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const Cart = () => {
  const { cart, updateCartItem, removeCartItem, clearCart, checkout, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const subtotal = cart.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  
  const handleCheckout = async () => {
    await checkout();
    navigate('/orders');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl font-medium">Your cart is empty</p>
              <p className="text-muted-foreground mb-6">Add some products to your cart to continue shopping</p>
              <Button onClick={() => navigate('/')}>Browse Products</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="font-semibold">
                            {new Intl.NumberFormat().format(item.unitPrice * item.quantity)} UGX
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Code: {item.productCode}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                              disabled={isLoading}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              className="w-16 h-8 text-center"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  updateCartItem(item.id, value);
                                }
                              }}
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              disabled={isLoading}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(item.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => clearCart()} disabled={isLoading}>
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat().format(subtotal)} UGX</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat().format(subtotal)} UGX</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCheckout}
                  disabled={isLoading || cart.length === 0}
                >
                  {isLoading ? 'Processing...' : 'Checkout'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
