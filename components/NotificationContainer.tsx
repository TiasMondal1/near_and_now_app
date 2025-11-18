import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { Theme } from '../constants/Theme';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { backgroundColor: Theme.colors.success };
      case 'error':
        return { backgroundColor: Theme.colors.error };
      case 'warning':
        return { backgroundColor: Theme.colors.warning };
      default:
        return { backgroundColor: Theme.colors.primary };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <TouchableOpacity
          key={notification.id}
          style={[styles.notification, getNotificationStyle(notification.type)]}
          onPress={() => removeNotification(notification.id)}
          activeOpacity={0.9}
        >
          <Text style={styles.message}>{notification.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Theme.spacing.md,
  },
  notification: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    ...Theme.shadows.lg,
  },
  message: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
});

export default NotificationContainer;



