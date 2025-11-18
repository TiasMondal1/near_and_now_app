import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  color?: string;
  created_at?: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}



