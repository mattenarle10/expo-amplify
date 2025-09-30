import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { confirmSignUp, resendSignUpCode } from '@aws-amplify/auth';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function SignUpVerify() {
  const router = useRouter();
  const { username, email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp({
        username: email as string,
        confirmationCode: code.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Email verified!',
        text2: 'You can now sign in',
      });

      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: error.message || 'Invalid code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendSignUpCode({ username: email as string });
      Toast.show({
        type: 'success',
        text1: 'Code sent!',
        text2: 'Check your email',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to resend',
        text2: error.message,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Mail size={32} color={Colors.black} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
          />

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={code.length !== 6}
          />
        </View>

        {/* Resend */}
        <View style={styles.resend}>
          <Text style={styles.resendText}>Didn't receive it?</Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray200,
  },
  dotActive: {
    backgroundColor: Colors.black,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: Colors.black,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  form: {
    marginBottom: 24,
  },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    color: Colors.gray600,
    fontFamily: 'DMSans_400Regular',
  },
  resendLink: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
