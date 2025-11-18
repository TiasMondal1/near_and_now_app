import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { Theme } from '../constants/Theme';
import { formatPrice } from '../utils/formatters';
import Button from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { cartItems, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useCart();

  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const discount = cartTotal > 1000 ? cartTotal * 0.1 : 0;
  const orderTotal = cartTotal + deliveryFee - discount;

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number, isLoose?: boolean) => {
    const increment = isLoose ? 0.25 : 1;
    const newQuantity = isLoose
      ? parseFloat((currentQuantity + increment).toFixed(2))
      : currentQuantity + increment;
    updateCartQuantity(itemId, newQuantity);
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number, isLoose?: boolean) => {
    const decrement = isLoose ? 0.25 : 1;
    const minQuantity = isLoose ? 0.25 : 1;

    if (currentQuantity > minQuantity) {
      const newQuantity = isLoose
        ? parseFloat((currentQuantity - decrement).toFixed(2))
        : currentQuantity - decrement;
      updateCartQuantity(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('Checkout' as never);
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={Theme.colors.gray400} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Button
          title="Start Shopping"
          onPress={() => navigation.navigate('ShopTab' as never)}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/100x100' }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              {item.isLoose && (
                <Text style={styles.itemSize}>Per kg</Text>
              )}
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDecreaseQuantity(item.id, item.quantity, item.isLoose)}
              >
                <Ionicons name="remove" size={18} color={Theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {item.isLoose ? `${item.quantity} kg` : item.quantity}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncreaseQuantity(item.id, item.quantity, item.isLoose)}
              >
                <Ionicons name="add" size={18} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Theme.colors.success }]}>
                Discount (10%)
              </Text>
              <Text style={[styles.summaryValue, { color: Theme.colors.success }]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(orderTotal)}</Text>
          </View>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.gray100,
  },
  itemDetails: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  itemName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  itemPrice: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  itemSize: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.gray100,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xs,
    marginHorizontal: Theme.spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.sm,
  },
  quantityText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
    marginHorizontal: Theme.spacing.sm,
    minWidth: 50,
    textAlign: 'center',
  },
  removeButton: {
    padding: Theme.spacing.xs,
  },
  footer: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  summary: {
    marginBottom: Theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
  },
  totalRow: {
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  totalLabel: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
  },
  checkoutButton: {
    marginTop: Theme.spacing.sm,
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
    marginBottom: Theme.spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default CartScreen;



