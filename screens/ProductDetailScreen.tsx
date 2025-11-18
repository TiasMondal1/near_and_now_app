import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase, Product } from '../services/supabase';
import { Theme } from '../constants/Theme';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import Button from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen: React.FC = () => {
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  const { addToCart, cartItems, updateCartQuantity, removeFromCart } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [looseQuantity, setLooseQuantity] = useState('0.25');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      showNotification('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cartItem = cartItems.find(item => item.id === product?.id && item.isLoose === product?.isLoose);
  const inCart = Boolean(cartItem);
  const quantity = cartItem?.quantity ?? 0;

  const handleAddToCart = () => {
    if (!product) return;

    if (product.isLoose) {
      const qty = parseFloat(looseQuantity);
      if (qty >= 0.25) {
        addToCart(product, qty, true);
        showNotification('Added to cart', 'success');
      }
    } else {
      addToCart(product, 1, false);
      showNotification('Added to cart', 'success');
    }
  };

  const handleIncreaseQuantity = () => {
    if (!product) return;
    const increment = product.isLoose ? 0.25 : 1;
    const newQuantity = product.isLoose
      ? parseFloat((quantity + increment).toFixed(2))
      : quantity + increment;
    updateCartQuantity(product.id, newQuantity);
  };

  const handleDecreaseQuantity = () => {
    if (!product) return;
    const decrement = product.isLoose ? 0.25 : 1;
    const minQuantity = product.isLoose ? 0.25 : 1;

    if (quantity > minQuantity) {
      const newQuantity = product.isLoose
        ? parseFloat((quantity - decrement).toFixed(2))
        : quantity - decrement;
      updateCartQuantity(product.id, newQuantity);
    } else {
      removeFromCart(product.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/400x400?text=No+Image' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {discount > 0 && (
            <>
              <Text style={styles.originalPrice}>{formatPrice(product.original_price || 0)}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            </>
          )}
        </View>

        {(product.size || product.weight) && (
          <Text style={styles.size}>
            Size: {product.size || product.weight}
          </Text>
        )}

        {product.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {inCart ? (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecreaseQuantity}
              >
                <Ionicons name="remove" size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {product.isLoose ? `${quantity} kg` : quantity}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
              >
                <Ionicons name="add" size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : product.isLoose ? (
          <View style={styles.looseContainer}>
            <Text style={styles.looseLabel}>Quantity (kg):</Text>
            <TextInput
              style={styles.looseInput}
              value={looseQuantity}
              onChangeText={setLooseQuantity}
              keyboardType="decimal-pad"
              placeholder="0.25"
            />
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              style={styles.addButton}
            />
          </View>
        ) : (
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            style={styles.addButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: Theme.colors.gray100,
  },
  content: {
    padding: Theme.spacing.md,
  },
  name: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  price: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
    marginRight: Theme.spacing.sm,
  },
  originalPrice: {
    fontSize: Theme.fontSize.lg,
    color: Theme.colors.gray500,
    textDecorationLine: 'line-through',
    marginRight: Theme.spacing.sm,
  },
  discountBadge: {
    backgroundColor: Theme.colors.error,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  discountText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
  },
  size: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  descriptionContainer: {
    marginBottom: Theme.spacing.lg,
  },
  descriptionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  quantityContainer: {
    marginTop: Theme.spacing.lg,
  },
  quantityLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.gray100,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  quantityText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginHorizontal: Theme.spacing.lg,
    minWidth: 80,
    textAlign: 'center',
  },
  looseContainer: {
    marginTop: Theme.spacing.lg,
  },
  looseLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  looseInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
  },
  addButton: {
    marginTop: Theme.spacing.md,
  },
});

export default ProductDetailScreen;



