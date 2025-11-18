import { createClient } from '@supabase/supabase-js';

// Supabase configuration - same as web app
const SUPABASE_URL = 'https://mpbszymyubxavjoxhzfm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnN6eW15dWJ4YXZqb3hoemZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTc5OTQsImV4cCI6MjA2OTg3Mzk5NH0.NnHFwGCkNpTWorV8O6vgn6uuqYPRek1QK4Sk_rcqLOg';

// Create Supabase client for public operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image?: string;
  image_url?: string;
  category: string;
  in_stock: boolean;
  rating?: number;
  size?: string;
  weight?: string;
  created_at?: string;
  isLoose?: boolean;
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    console.log('🔄 Fetching products from Supabase...');
    
    let allProducts: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (data && data.length > 0) {
        allProducts = [...allProducts, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Successfully fetched ${allProducts.length} products`);
    return transformSupabaseProducts(allProducts);
  } catch (error) {
    console.error('❌ Error in getAllProducts:', error);
    throw error;
  }
}

// Get products by category
export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    console.log('🔎 getProductsByCategory - Querying for category:', categoryName);
    
    let allProducts: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryName)
        .eq('in_stock', true)
        .order('rating', { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('❌ Error fetching products by category:', error);
        return [];
      }

      if (data && data.length > 0) {
        allProducts = [...allProducts, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log('✅ getProductsByCategory - Transformed products:', allProducts.length);
    return transformSupabaseProducts(allProducts);
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return [];
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .ilike('name', `%${query}%`);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return transformSupabaseProducts(data || []);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return [];
  }
}

// Transform products from Supabase format to frontend format
function transformSupabaseProducts(products: any[]): Product[] {
  return products.map(product => ({
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    image: product.image_url || product.image
  }));
}

// Authentication types
export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
}

// Login with OTP
export async function loginWithOTP(phone: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

// Verify OTP
export async function verifyOTP(phone: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Logout
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

// Order types
export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderData {
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  order_status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  order_total: number;
  subtotal: number;
  delivery_fee: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  order_status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  order_total: number;
  subtotal?: number;
  delivery_fee?: number;
  items?: OrderItem[];
  items_count?: number;
  shipping_address?: ShippingAddress;
  created_at: string;
  updated_at?: string;
  order_number?: string;
}

// Generate order number
async function generateOrderNumber(): Promise<string> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const prefix = `NN${dateString}`;
    
    const { data, error } = await supabase.rpc('generate_next_order_number', {
      date_prefix: prefix
    });

    if (error) {
      console.error('Error generating order number via RPC:', error);
      throw new Error(`Failed to generate order number: ${error.message}`);
    }

    if (!data || typeof data !== 'string') {
      throw new Error('Invalid response from order number generator');
    }

    return data;
  } catch (error) {
    console.error('Error generating order number:', error);
    throw error;
  }
}

// Create order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  try {
    console.log('🛒 Creating order...', orderData);
    
    const orderNumber = await generateOrderNumber();
    console.log('📝 Generated order number:', orderNumber);
    
    const orderPayload = {
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email || null,
      customer_phone: orderData.customer_phone,
      order_status: orderData.order_status,
      payment_status: orderData.payment_status,
      payment_method: orderData.payment_method,
      order_total: orderData.order_total,
      subtotal: orderData.subtotal,
      delivery_fee: orderData.delivery_fee,
      items: orderData.items,
      shipping_address: orderData.shipping_address,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    console.log('✅ Order created successfully:', data);
    
    return {
      ...data,
      items_count: data.items?.length || 0
    };
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    throw error;
  }
}

// Get user orders
export async function getUserOrders(userId?: string, userPhone?: string, userEmail?: string): Promise<Order[]> {
  try {
    console.log('📦 Fetching orders for user:', userId, 'phone:', userPhone, 'email:', userEmail);
    
    const queries = [];
    
    if (userId) {
      queries.push(
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
      );
    }
    if (userPhone) {
      queries.push(
        supabase
          .from('orders')
          .select('*')
          .eq('customer_phone', userPhone)
      );
    }
    if (userEmail) {
      queries.push(
        supabase
          .from('orders')
          .select('*')
          .eq('customer_email', userEmail)
      );
    }
    
    if (queries.length > 0) {
      const results = await Promise.all(queries);
      
      const allOrders: Order[] = [];
      const orderIds = new Set<string>();
      
      for (const result of results) {
        if (result.error) {
          console.warn('⚠️ Error in one of the order queries:', result.error);
          continue;
        }
        if (result.data) {
          for (const order of result.data) {
            if (!orderIds.has(order.id)) {
              orderIds.add(order.id);
              allOrders.push(order);
            }
          }
        }
      }
      
      allOrders.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      console.log(`✅ Fetched ${allOrders.length} orders for user`);
      
      return allOrders.map(order => ({
        ...order,
        items_count: order.items?.length || 0
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error in getUserOrders:', error);
    throw error;
  }
}



