import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';

const ThankYouScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={Theme.colors.success} />
        </View>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Thank you for your order. We'll notify you once your order is confirmed.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="View Orders"
            onPress={() => navigation.navigate('Orders' as never)}
            style={styles.button}
          />
          <Button
            title="Continue Shopping"
            onPress={() => navigation.navigate('MainTabs' as never)}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});

export default ThankYouScreen;



