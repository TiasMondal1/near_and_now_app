import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated, logoutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={80} color={Theme.colors.gray400} />
          <Text style={styles.emptyText}>Please login to view your profile</Text>
          <Button
            title="Login"
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.phone}>{user?.phone || user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <Ionicons name="receipt-outline" size={24} color={Theme.colors.primary} />
          <Text style={styles.menuItemText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Addresses' as never)}
        >
          <Ionicons name="location-outline" size={24} color={Theme.colors.primary} />
          <Text style={styles.menuItemText}>My Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('About' as never)}
        >
          <Ionicons name="information-circle-outline" size={24} color={Theme.colors.primary} />
          <Text style={styles.menuItemText}>About Us</Text>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarText: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
  },
  name: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  phone: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  menu: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.md,
  },
  footer: {
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },
  logoutButton: {
    borderColor: Theme.colors.error,
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
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default ProfileScreen;



