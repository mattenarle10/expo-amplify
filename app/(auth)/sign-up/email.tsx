import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function SignUpEmail() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!email.trim()) {
      return;
    }
    router.push({
      pathname: '/(auth)/sign-up/password',
      params: { username, email: email.trim() },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.black} />
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progress}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What's your email?</Text>
          <Text style={styles.subtitle}>We'll send you a verification code</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.gray500} />}
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!email.trim()}
          />
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    fontFamily: 'DMSans_400Regular',
  },
  form: {
    marginBottom: 32,
  },
});
