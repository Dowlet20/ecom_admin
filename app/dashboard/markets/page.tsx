'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin, Phone, DollarSign, Check, X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { useToast } from '@/hooks/use-toast';
import axiosInstance, { base_url } from '@/lib/axios';
import DashboardLayout from '@/components/Layout/DashboardLayout';

interface MarketForm {
  name: string;
  name_ru: string;
  phone: string;
  delivery_price: number;
  location: string;
  location_ru: string;
  password: string;
  thumbnail: FileList;
}

interface Market {
  id: number;
  name: string;
  name_ru: string;
  phone: string;
  password: string;
  delivery_price: number;
  location: string;
  location_ru: string;
  thumbnail_url?: string;
  isVIP: boolean;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [editingField, setEditingField] = useState<{ marketId: number; field: string } | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [updatingField, setUpdatingField] = useState<{ [key: string]: boolean }>({});
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MarketForm>();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [currentPage]);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/markets');
      setMarkets(response.data.data || response.data);
      setTotalPages(Math.ceil((response.data.total || response.data.length) / 10));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch markets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MarketForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('name_ru', data.name_ru);
      formData.append('phone', data.phone);
      formData.append('delivery_price', data.delivery_price.toString());
      formData.append('location', data.location);
      formData.append('location_ru', data.location_ru);
      formData.append('password', data.password);
      
      if (data.thumbnail && data.thumbnail[0]) {
        formData.append('thumbnail', data.thumbnail[0]);
      }

      const response = await axiosInstance.post('/api/superadmin/markets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({
        title: "Success",
        description: `Market created! Phone: ${response.data.phone}, Password: ${response.data.password}`
      });
      setIsModalOpen(false);
      reset();
      fetchMarkets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create market",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (marketId: number, field: string, currentValue: string) => {
    setEditingField({ marketId, field });
    setEditValues({ [`${marketId}-${field}`]: currentValue });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };

  const updateMarketField = async (marketId: number, field: string, value: string) => {
  const updateKey = `${marketId}-${field}`;
  setUpdatingField(prev => ({ ...prev, [updateKey]: true }));

  try {
    // Create FormData object
    const formData = new FormData();
    // Append the field and value to FormData
    formData.append(field, field === 'delivery_price' ? parseFloat(value).toString() : value);

    console.log('FormData entries:');
    for (const [key, val] of formData.entries()) {
      console.log(`${key}: ${val}`);
    }

    // Send the PUT request with FormData
    await axiosInstance.put(`/api/superadmin/markets/${marketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update the markets state
    setMarkets(prev =>
      prev.map(market =>
        market.id === marketId
          ? { ...market, [field]: field === 'delivery_price' ? parseFloat(value) : value }
          : market
      )
    );

    toast({
      title: 'Success',
      description: `${field.replace('_', ' ')} updated successfully`,
    });

    setEditingField(null);
    setEditValues({});
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || `Failed to update ${field}`,
      variant: 'destructive',
    });
  } finally {
    setUpdatingField(prev => ({ ...prev, [updateKey]: false }));
  }
};

  const updateMarketThumbnail = async (marketId: number, file: File) => {
    const updateKey = `${marketId}-thumbnail`;
    setUpdatingField(prev => ({ ...prev, [updateKey]: true }));

    console.log(file)
    console.log(marketId)

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.put(`/api/superadmin/markets/${marketId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMarkets(prev => prev.map(market => 
        market.id === marketId 
          ? { ...market, thumbnail_url: response.data.thumbnail_url }
          : market
      ));
      
      toast({
        title: "Success",
        description: "Thumbnail updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update thumbnail",
        variant: "destructive"
      });
    } finally {
      setUpdatingField(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const deleteMarket = async (id: number) => {
    if (!confirm('Are you sure you want to delete this market?')) return;

    try {
      await axiosInstance.delete(`/api/superadmin/markets/${id}`);
      setMarkets(prev => prev.filter(market => market.id !== id));
      toast({
        title: "Success",
        description: "Market deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete market",
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderEditableField = (market: Market, field: keyof Market, label: string, icon: React.ElementType) => {
    const isEditing = editingField?.marketId === market.id && editingField?.field === field;
    const updateKey = `${market.id}-${field}`;
    const isUpdating = updatingField[updateKey];
    const currentValue = editValues[`${market.id}-${field}`] ?? String(market[field]);
    const Icon = icon;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2 text-sm">
          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center space-x-2 flex-1">
            <Input
              type={field === 'delivery_price' ? 'number' : 'text'}
              step={field === 'delivery_price' ? '0.01' : undefined}
              value={currentValue}
              onChange={(e) => setEditValues(prev => ({ ...prev, [`${market.id}-${field}`]: e.target.value }))}
              className="h-8 text-sm flex-1"
              disabled={isUpdating}
            />
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (field === 'password') {
                    const isConfirmed = window.confirm(`Are you sure you want to update this password to "${currentValue}"?`);
                    if (!isConfirmed) return; // Exit if user cancels
                  }
                  updateMarketField(market.id, field, currentValue);
                }}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEditing}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between space-x-2 p-2 rounded-lg hover:bg-gray-50 group">
        <div className="flex items-center space-x-2 flex-1">
          <Icon className="w-4 h-4 text-gray-500" />
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={currentValue}
                onChange={(e) => setEditValues(prev => ({ 
                  ...prev, 
                  [`${market.id}-${field}`]: e.target.value 
                }))}
                className="flex-1"
                type={field === 'delivery_price' ? 'number' : 'text'}
                step={field === 'delivery_price' ? '0.01' : undefined}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (field === 'password') {
                    const isConfirmed = window.confirm(`Siz hakykatdan hem bu marketiň parolyny üýtetmek isleýärsiňizmi? täze parol: "${currentValue}"?`);
                    if (!isConfirmed) return; // Exit if user cancels
                  }
                  updateMarketField(market.id, field, currentValue);
                }}
                disabled={isUpdating}
                className="h-8 w-8 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-sm text-gray-600">{label}:</span>
                <span className="ml-2 font-medium">
                  {field === 'password' && !showPasswords[market.id] 
                    ? '' 
                    : field === 'delivery_price' 
                      ? `$${market[field]}` 
                      : String(market[field])}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {/* {field === 'password' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility(market.id)}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  >
                    {showPasswords[market.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )} */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(market.id, field, String(market[field]))}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!hasMounted) return null;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Markets Management</h1>
            <p className="text-gray-600 mt-2">Manage your markets with inline editing</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Market</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Market</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name (English)</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Market name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name_ru">Name (Russian)</Label>
                    <Input
                      id="name_ru"
                      {...register('name_ru', { required: 'Russian name is required' })}
                      placeholder="Название магазина"
                    />
                    {errors.name_ru && (
                      <p className="text-red-500 text-sm mt-1">{errors.name_ru.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      {...register('password', { required: 'Password is required' })}
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="delivery_price">Delivery Price</Label>
                    <Input
                      id="delivery_price"
                      {...register('delivery_price', { 
                        required: 'Delivery price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                    {errors.delivery_price && (
                      <p className="text-red-500 text-sm mt-1">{errors.delivery_price.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location (English)</Label>
                    <Input
                      id="location"
                      {...register('location', { required: 'Location is required' })}
                      placeholder="City, Country"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="location_ru">Location (Russian)</Label>
                    <Input
                      id="location_ru"
                      {...register('location_ru', { required: 'Russian location is required' })}
                      placeholder="Город, Страна"
                    />
                    {errors.location_ru && (
                      <p className="text-red-500 text-sm mt-1">{errors.location_ru.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail Image</Label>
                  <Input
                    id="thumbnail"
                    {...register('thumbnail')}
                    type="file"
                    accept="image/*"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Market'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <Card key={market.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  {market.thumbnail_url ? (
                    <Image
                      src={base_url+market.thumbnail_url}
                      alt={market.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Upload className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Thumbnail Update Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            updateMarketThumbnail(market.id, e.target.files[0]);
                          }
                        }}
                      />
                      <div className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                    </label>
                  </div>
                  
                  {/* VIP Badge */}
                  {market.isVIP && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                      VIP
                    </Badge>
                  )}
                  
                  {/* Updating Spinner */}
                  {updatingField[`${market.id}-thumbnail`] && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-2">
                  {renderEditableField(market, 'name', 'Name (EN)', Edit)}
                  {renderEditableField(market, 'name_ru', 'Name (RU)', Edit)}
                  {renderEditableField(market, 'phone', 'Phone', Phone)}
                  {renderEditableField(market, 'password', 'Password', Eye)}
                  {renderEditableField(market, 'delivery_price', 'Delivery Price', DollarSign)}
                  {renderEditableField(market, 'location', 'Location (EN)', MapPin)}
                  {renderEditableField(market, 'location_ru', 'Location (RU)', MapPin)}

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const isConfirmed = window.confirm("Siz bu marketi hakykatdanam pozmak isleýärsiňizmi?");
                        if (!isConfirmed) return; 
                        deleteMarket(market.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}