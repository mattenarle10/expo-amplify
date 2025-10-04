import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
import { signUp } from '@aws-amplify/auth';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function SignUpPassword() {
  const router = useRouter();
  const { username, email } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial && passwordsMatch;

  const handleSignUp = async () => {
    if (!isValid) {
      Toast.show({
        type: 'error',
        text1: 'Invalid password',
        text2: 'Please meet all requirements',
      });
      return;
    }

    setLoading(true);
    try {
      await signUp({
        username: email as string,
        password,
        options: {
          userAttributes: {
            email: email as string,
            preferred_username: username as string,
          },
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Check your email for verification code',
      });

      router.push({
        pathname: '/(auth)/sign-up/verify',
        params: { username, email },
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign up failed',
        text2: error.message || 'Please try again',
      });
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
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.black} />
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progress}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create a password</Text>
            <Text style={styles.subtitle}>Must meet all requirements</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              icon={<Lock size={20} color={Colors.gray500} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.gray500} />
                  ) : (
                    <Eye size={20} color={Colors.gray500} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              icon={<Lock size={20} color={Colors.gray500} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.gray500} />
                  ) : (
                    <Eye size={20} color={Colors.gray500} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Requirements */}
            <View style={styles.requirements}>
              <RequirementItem text="At least 8 characters" met={hasMinLength} />
              <RequirementItem text="Uppercase & lowercase" met={hasUpperCase && hasLowerCase} />
              <RequirementItem text="Number" met={hasNumber} />
              <RequirementItem text="Special character" met={hasSpecial} />
              <RequirementItem text="Passwords match" met={passwordsMatch} />
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={!isValid}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const RequirementItem = ({ text, met }: { text: string; met: boolean }) => (
  <View style={styles.requirement}>
    <View style={[styles.checkCircle, met && styles.checkCircleMet]}>
      {met && <Check size={12} color={Colors.white} strokeWidth={3} />}
    </View>
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
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
  requirements: {
    marginBottom: 24,
    gap: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleMet: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.gray500,
    fontFamily: 'DMSans_400Regular',
  },
  requirementTextMet: {
    color: Colors.black,
  },
});
