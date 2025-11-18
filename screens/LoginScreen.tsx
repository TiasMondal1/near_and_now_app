import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Theme } from '../constants/Theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginScreen: React.FC = () => {
  const { loginWithPhone, verifyOTPCode } = useAuth();
  const { showNotification } = useNotification();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      showNotification('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    try {
      setLoading(true);
      await loginWithPhone(`+91${phone}`);
      setStep('otp');
      showNotification('OTP sent to your phone', 'success');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showNotification(error.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showNotification('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      await verifyOTPCode(`+91${phone}`, otp);
      showNotification('Login successful!', 'success');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      showNotification(error.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Near & Now</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your phone number to continue'
              : 'Enter the OTP sent to your phone'}
          </Text>

          {step === 'phone' ? (
            <>
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
                style={styles.button}
              />
            </>
          ) : (
            <>
              <Input
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <Button
                title="Verify OTP"
                onPress={handleVerifyOTP}
                loading={loading}
                style={styles.button}
              />
              <Button
                title="Change Phone Number"
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                }}
                variant="outline"
                style={styles.button}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  content: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    ...Theme.shadows.lg,
  },
  title: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  button: {
    marginTop: Theme.spacing.md,
  },
});

export default LoginScreen;



