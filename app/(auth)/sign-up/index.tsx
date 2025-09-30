import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function SignUpUsername() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  const handleContinue = () => {
    if (!username.trim()) {
      return;
    }
    // Pass username to next screen via params
    router.push({
      pathname: '/(auth)/sign-up/email',
      params: { username: username.trim() },
    });
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
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose your username</Text>
          <Text style={styles.subtitle}>This is how others will see you</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            icon={<User size={20} color={Colors.gray500} />}
            autoCapitalize="none"
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!username.trim()}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.link}>Sign in</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray600,
    fontFamily: 'DMSans_400Regular',
  },
  link: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
