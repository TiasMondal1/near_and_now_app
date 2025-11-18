import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getAllProducts, Product } from '../services/supabase';
import { Theme } from '../constants/Theme';
import ProductCard from '../components/ProductCard';
import { useNotification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

const ShopScreen: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    sortProducts();
  }, [products, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const sortProducts = () => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    setDisplayedProducts(sorted);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'name-asc':
        return 'Name: A to Z';
      case 'name-desc':
        return 'Name: Z to A';
      default:
        return 'Sort By';
    }
  };

  return (
    <View style={styles.container}>
      {/* Sort Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <Ionicons name="filter" size={20} color={Theme.colors.primary} />
          <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options Modal */}
      {showSortModal && (
        <View style={styles.sortModal}>
          {['default', 'price-low', 'price-high', 'name-asc', 'name-desc'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortOption,
                sortBy === option && styles.sortOptionActive,
              ]}
              onPress={() => {
                setSortBy(option as SortOption);
                setShowSortModal(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextActive,
                ]}
              >
                {option === 'default'
                  ? 'Default'
                  : option === 'price-low'
                  ? 'Price: Low to High'
                  : option === 'price-high'
                  ? 'Price: High to Low'
                  : option === 'name-asc'
                  ? 'Name: A to Z'
                  : 'Name: Z to A'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    ...Theme.shadows.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sortButtonText: {
    marginLeft: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text,
  },
  sortModal: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  sortOption: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xs,
  },
  sortOptionActive: {
    backgroundColor: Theme.colors.primary + '20',
  },
  sortOptionText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text,
  },
  sortOptionTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.semibold,
  },
  productsList: {
    padding: Theme.spacing.md,
  },
  productWrapper: {
    width: '48%',
    marginBottom: Theme.spacing.md,
    marginHorizontal: '1%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
  },
});

export default ShopScreen;



