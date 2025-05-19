
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      toast("Please login to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate("/login")
        }
      });
      return;
    }
    await addToCart(product, 1);
  };

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat().format(product.price);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">{product.name}</h3>
          <span className="text-xs text-muted-foreground">{product.code}</span>
        </div>
        <div className="mb-2 text-sm text-muted-foreground">{product.type}</div>
        <div className="text-lg font-bold">{formattedPrice} UGX</div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
