
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: apiService.getPurchases,
    enabled: !!user,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      
      {orders && orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order) => (
                <AccordionItem key={order.id} value={`order-${order.id}`}>
                  <AccordionTrigger className="py-4">
                    <div className="flex flex-col sm:flex-row w-full justify-between">
                      <div>Order #{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                      <div className="font-semibold">
                        {new Intl.NumberFormat().format(order.total)} UGX
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat().format(item.unitPrice)} UGX
                              </TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat().format(item.total)} UGX
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl font-medium">No orders found</p>
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
              <Button onClick={() => navigate('/')}>Start Shopping</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
