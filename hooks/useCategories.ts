import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSACTION_CATEGORIES as DEFAULT_CATEGORIES } from '../constants/Categories'; // Import default categories

const CATEGORIES_STORAGE_KEY = 'user_defined_categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to load categories from storage', error);
        setCategories(DEFAULT_CATEGORIES); // Fallback to default on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save once initial load is complete
      const saveCategories = async () => {
        try {
          await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        } catch (error) {
          console.error('Failed to save categories to storage', error);
        }
      };
      saveCategories();
    }
  }, [categories, isLoading]);

  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory) && newCategory.trim() !== '') {
      setCategories(prevCategories => [...prevCategories, newCategory.trim()]);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(prevCategories => prevCategories.filter(cat => cat !== categoryToRemove));
  };

  return { categories, addCategory, removeCategory, isLoading };
};