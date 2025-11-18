import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useCart } from '../context/CartContext';
import { Product } from '../services/supabase';
import { Theme } from '../constants/Theme';
import { formatPrice, truncateText } from '../utils/formatters';
import { useNavigation } from '@react-navigation/native';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigation = useNavigation();
  const { addToCart, cartItems, updateCartQuantity, removeFromCart } = useCart();
  const [looseQuantity, setLooseQuantity] = useState('0.25');

  const cartItem = cartItems.find(item => item.id === product.id && item.isLoose === product.isLoose);
  const inCart = Boolean(cartItem);
  const quantity = cartItem?.quantity ?? 0;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const displayOriginalPrice = product.original_price || Math.round(product.price * 1.35);

  const handleAddToCart = () => {
    if (product.isLoose) {
      const qty = parseFloat(looseQuantity);
      if (qty >= 0.25) {
        addToCart(product, qty, true);
      }
    } else {
      addToCart(product, 1, false);
    }
  };

  const handleIncreaseQuantity = () => {
    const increment = product.isLoose ? 0.25 : 1;
    const newQuantity = product.isLoose
      ? parseFloat((quantity + increment).toFixed(2))
      : quantity + increment;
    updateCartQuantity(product.id, newQuantity);
  };

  const handleDecreaseQuantity = () => {
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

  const handlePress = () => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/300x300?text=No+Image' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {truncateText(product.name, 50)}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {discount > 0 && (
            <Text style={styles.originalPrice}>{formatPrice(displayOriginalPrice)}</Text>
          )}
          {(product.isLoose || product.size || product.weight) && (
            <Text style={styles.size}>
              {product.isLoose ? 'Per kg' : (product.size || product.weight)}
            </Text>
          )}
        </View>

        {inCart ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>
              {product.isLoose ? `${quantity} kg` : quantity}
            </Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : product.isLoose ? (
          <View style={styles.looseContainer}>
            <View style={styles.looseInputRow}>
              <TextInput
                style={styles.looseInput}
                value={looseQuantity}
                onChangeText={setLooseQuantity}
                keyboardType="decimal-pad"
                placeholder="0.25"
              />
              <Text style={styles.kgText}>kg</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Theme.colors.gray100,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: Theme.colors.error,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    zIndex: 1,
  },
  discountText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Theme.spacing.md,
  },
  name: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
    marginRight: Theme.spacing.sm,
  },
  originalPrice: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.gray500,
    textDecorationLine: 'line-through',
    marginRight: Theme.spacing.sm,
  },
  size: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.gray500,
    marginLeft: 'auto',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.gray100,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.sm,
    ...Theme.shadows.sm,
  },
  quantityButtonText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
  },
  quantityText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginHorizontal: Theme.spacing.md,
    minWidth: 60,
    textAlign: 'center',
  },
  looseContainer: {
    gap: Theme.spacing.sm,
  },
  looseInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  looseInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text,
    width: 80,
    backgroundColor: Theme.colors.white,
  },
  kgText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.gray500,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
});

export default ProductCard;



