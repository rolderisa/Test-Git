
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type SalesReportItem = {
  id: number;
  date: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
};

const ReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check if user is admin
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  // Fetch sales report data
  const { data: salesReport, isLoading, refetch } = useQuery({
    queryKey: ['salesReport', startDate, endDate],
    queryFn: () => 
      apiService.getSalesReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined),
  });

  const handleFilterChange = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading report data...</div>
      </div>
    );
  }

  // Calculate total sales
  const totalSales = salesReport?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilterChange}>Apply Filter</Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="text-xl font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{salesReport?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat().format(totalSales)} UGX
                </p>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {salesReport?.map((sale) => (
              <AccordionItem key={sale.id} value={`sale-${sale.id}`}>
                <AccordionTrigger className="py-4">
                  <div className="flex flex-col sm:flex-row w-full justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{sale.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{sale.customer.name}</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat().format(sale.total)} UGX
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2">
                    <div className="mb-4">
                      <h4 className="font-medium">Customer Details</h4>
                      <p>Name: {sale.customer.name}</p>
                      <p>Email: {sale.customer.email}</p>
                      <p>Phone: {sale.customer.phone}</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Code</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productCode}</TableCell>
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
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {new Intl.NumberFormat().format(sale.total)} UGX
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {salesReport?.length === 0 && (
            <div className="text-center py-8">
              <p>No sales data available for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportPage;
