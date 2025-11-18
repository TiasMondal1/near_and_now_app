import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

const AddressesScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={80} color={Theme.colors.gray400} />
        <Text style={styles.emptyText}>No saved addresses</Text>
        <Text style={styles.emptySubtext}>
          Your saved addresses will appear here
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    minHeight: 400,
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

export default AddressesScreen;



