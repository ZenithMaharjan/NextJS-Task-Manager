'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setWishlist } from '@/store/slices/wishlistSlice';
import apiService from '@/services/api';
import InventoryCard from '@/components/InventoryCard';
import { Inventory } from '@/types/inventory';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getWishlist();
      if (response.success) {
        dispatch(setWishlist(response.wishlists));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, router, fetchWishlist]);

  if (!isAuthenticated) return null;

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Heart className="fill-current text-indigo-500" />
            My Wishlist
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage the items you're interested in.
          </p>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start adding items from the inventory to track them here.
            </p>
            <button
              onClick={() => router.push('/inventory')}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors"
            >
              Browse Inventory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: Inventory) => (
              <InventoryCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
