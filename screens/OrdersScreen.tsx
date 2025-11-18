import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, Order } from '../services/supabase';
import { Theme } from '../constants/Theme';
import { formatPrice } from '../utils/formatters';
import { getTimeAgo } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const OrdersScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders(
        user?.id,
        user?.phone,
        user?.email
      );
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return Theme.colors.success;
      case 'cancelled':
        return Theme.colors.error;
      case 'shipped':
        return Theme.colors.primary;
      default:
        return Theme.colors.warning;
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={Theme.colors.gray400} />
          <Text style={styles.emptyText}>Please login to view your orders</Text>
        </View>
      </View>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={Theme.colors.gray400} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Start shopping to see your orders here</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>
                Order #{order.order_number || order.id.substring(0, 8)}
              </Text>
              <Text style={styles.orderDate}>
                {getTimeAgo(order.created_at)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.order_status) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.order_status) },
                ]}
              >
                {order.order_status.charAt(0).toUpperCase() +
                  order.order_status.slice(1)}
              </Text>
            </View>
          </View>

          {order.items && order.items.length > 0 && (
            <View style={styles.itemsContainer}>
              {order.items.slice(0, 3).map((item, index) => (
                <Text key={index} style={styles.itemText}>
                  {item.name} × {item.quantity}
                </Text>
              ))}
              {order.items.length > 3 && (
                <Text style={styles.moreItemsText}>
                  +{order.items.length - 3} more items
                </Text>
              )}
            </View>
          )}

          <View style={styles.orderFooter}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(order.order_total)}
            </Text>
          </View>

          {order.shipping_address && (
            <View style={styles.addressContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Theme.colors.textSecondary}
              />
              <Text style={styles.addressText}>
                {order.shipping_address.address}, {order.shipping_address.city}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  orderCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    margin: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  orderNumber: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  statusText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  itemsContainer: {
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  itemText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  totalLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  addressText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.xs,
    flex: 1,
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

export default OrdersScreen;



