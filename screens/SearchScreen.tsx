import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { searchProducts, Product } from '../services/supabase';
import { Theme } from '../constants/Theme';
import ProductCard from '../components/ProductCard';
import { useNotification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen: React.FC = () => {
  const { showNotification } = useNotification();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const popularSearches = ['Rice', 'Milk', 'Vegetables', 'Atta', 'Oil'];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const data = await searchProducts(searchQuery);
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
      showNotification('Failed to search products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Theme.colors.gray400} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products, brands and more..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Theme.colors.gray400} />
          </TouchableOpacity>
        )}
      </View>

      {!hasSearched && query.length === 0 && (
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <View style={styles.popularTags}>
            {popularSearches.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.popularTag}
                onPress={() => setQuery(term)}
              >
                <Text style={styles.popularTagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Searching...</Text>
        </View>
      ) : hasSearched && products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color={Theme.colors.gray400} />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          ListHeaderComponent={
            hasSearched && products.length > 0 ? (
              <Text style={styles.resultsText}>
                {products.length} result{products.length !== 1 ? 's' : ''} found
              </Text>
            ) : null
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    margin: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text,
    paddingVertical: Theme.spacing.md,
  },
  clearButton: {
    marginLeft: Theme.spacing.sm,
  },
  popularContainer: {
    padding: Theme.spacing.md,
  },
  popularTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  popularTag: {
    backgroundColor: Theme.colors.gray100,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  popularTagText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text,
  },
  productsList: {
    padding: Theme.spacing.md,
  },
  productWrapper: {
    width: '48%',
    marginBottom: Theme.spacing.md,
    marginHorizontal: '1%',
  },
  resultsText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
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
    fontSize: Theme.fontSize.lg,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen;



