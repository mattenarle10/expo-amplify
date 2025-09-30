import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '@aws-amplify/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      // User is signed in, go to app
      router.replace('/(app)/home');
    } catch {
      // User is not signed in, go to sign in
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.black} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
