'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Modal from '@/components/UI/Modal';
import axiosInstance, { base_url } from '@/lib/axios';
import { Banner } from '@/types';

interface BannerForm {
  description: string;
  thumbnail: FileList;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  const { register, handleSubmit, reset, formState: { errors } } = useForm<BannerForm>();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/banners');
      setBanners(response.data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };
  console.log(banners)
  const onSubmit = async (data: BannerForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      
      if (data.thumbnail && data.thumbnail[0]) {
        formData.append('thumbnail', data.thumbnail[0]);
      }

      await axiosInstance.post('/api/superadmin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Banner created successfully');
      setIsModalOpen(false);
      reset();
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      await axiosInstance.delete(`/api/superadmin/banners/${id}`);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

   if (!hasMounted) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
            <p className="text-gray-600 mt-2">Manage promotional banners</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Banner</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map((banner) => (
              <div key={banner.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="relative h-48 lg:h-32 lg:w-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {banner.thumbnail_url ? (
                      <Image
                        src={base_url+banner.thumbnail_url}
                        alt={banner.description}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Image className="w-12 h-12" src={''} alt={''} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{banner.description}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" src={''} alt={''} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
                <p className="text-gray-600">Create your first banner to get started.</p>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Banner"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="input-field resize-none"
                placeholder="Banner description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <input
                {...register('thumbnail', { required: 'Image is required' })}
                type="file"
                accept="image/*"
                className="input-field"
              />
              {errors.thumbnail && (
                <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Banner'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}