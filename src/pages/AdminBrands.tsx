
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

// Temporary mock data (will be replaced with API data)
const MOCK_BRANDS = [
  { id: 1, name: 'Jaquar', description: 'Premium bathroom fixtures', product_count: 42 },
  { id: 2, name: 'Kohler', description: 'High-end bathroom solutions', product_count: 37 },
  { id: 3, name: 'Hindware', description: 'Affordable quality fixtures', product_count: 29 },
  { id: 4, name: 'Cera', description: 'Modern bathroom designs', product_count: 25 },
  { id: 5, name: 'Parryware', description: 'Durable bathroom products', product_count: 18 },
];

const AdminBrands = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState(MOCK_BRANDS);

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      setBrands(brands.filter(brand => brand.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage brands and their associated products
          </p>
        </div>
        <Link to="/admin/brands/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell className="text-center">{brand.product_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(brand.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No brands found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBrands;
