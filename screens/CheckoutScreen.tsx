import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { createOrder, CreateOrderData } from '../services/supabase';
import { Theme } from '../constants/Theme';
import { formatPrice } from '../utils/formatters';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const calculateOrderTotals = (cartTotal: number) => {
  const subtotal = cartTotal;
  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const discount = cartTotal > 1000 ? cartTotal * 0.1 : 0;
  const orderTotal = subtotal + deliveryFee - discount;
  return { subtotal, deliveryFee, discount, orderTotal };
};

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { subtotal, deliveryFee, discount, orderTotal } = calculateOrderTotals(cartTotal);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderData: CreateOrderData = {
        user_id: user?.id,
        customer_name: formData.name,
        customer_email: formData.email || undefined,
        customer_phone: formData.phone,
        order_status: 'placed',
        payment_status: 'pending',
        payment_method: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        order_total: orderTotal,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        items: orderItems,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      await createOrder(orderData);
      showNotification('Order placed successfully! 🎉', 'success');
      clearCart();
      navigation.navigate('ThankYou' as never);
    } catch (error: any) {
      console.error('Error creating order:', error);
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Delivery Address</Text>
      <Input
        label="Full Name *"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Enter your full name"
      />
      <Input
        label="Phone Number *"
        value={formData.phone}
        onChangeText={(text) => handleChange('phone', text)}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />
      <Input
        label="Email (Optional)"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      <Input
        label="Address *"
        value={formData.address}
        onChangeText={(text) => handleChange('address', text)}
        placeholder="Enter your full address"
        multiline
        numberOfLines={3}
      />
      <Input
        label="City *"
        value={formData.city}
        onChangeText={(text) => handleChange('city', text)}
        placeholder="Enter your city"
      />
      <Input
        label="State *"
        value={formData.state}
        onChangeText={(text) => handleChange('state', text)}
        placeholder="Enter your state"
      />
      <Input
        label="Pincode *"
        value={formData.pincode}
        onChangeText={(text) => handleChange('pincode', text)}
        placeholder="Enter your pincode"
        keyboardType="number-pad"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          formData.paymentMethod === 'cod' && styles.paymentOptionActive,
        ]}
        onPress={() => handleChange('paymentMethod', 'cod')}
      >
        <Ionicons
          name={formData.paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={formData.paymentMethod === 'cod' ? Theme.colors.primary : Theme.colors.gray400}
        />
        <View style={styles.paymentOptionContent}>
          <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
          <Text style={styles.paymentOptionDescription}>Pay when you receive your order</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Order Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
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
              Discount
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

      <View style={styles.addressCard}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{formData.address}</Text>
        <Text style={styles.addressText}>
          {formData.city}, {formData.state} - {formData.pincode}
        </Text>
        <Text style={styles.addressText}>Phone: {formData.phone}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  currentStep >= step && styles.progressCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressText,
                    currentStep >= step && styles.progressTextActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  currentStep >= step && styles.progressLabelActive,
                ]}
              >
                {step === 1 ? 'Address' : step === 2 ? 'Payment' : 'Summary'}
              </Text>
            </View>
            {step < 3 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.progressLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title="Back"
            onPress={() => setCurrentStep(currentStep - 1)}
            variant="outline"
            style={styles.backButton}
          />
        )}
        <Button
          title={currentStep === 3 ? 'Place Order' : 'Continue'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.continueButton}
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: Theme.colors.primary,
  },
  progressText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.gray600,
  },
  progressTextActive: {
    color: Theme.colors.white,
  },
  progressLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  progressLabelActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Theme.colors.gray200,
    marginHorizontal: Theme.spacing.xs,
  },
  progressLineActive: {
    backgroundColor: Theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  stepContainer: {
    marginBottom: Theme.spacing.xl,
  },
  stepTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  paymentOptionActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + '10',
  },
  paymentOptionContent: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
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
  addressCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  addressTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  addressText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadows.lg,
    gap: Theme.spacing.md,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default CheckoutScreen;



