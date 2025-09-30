import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import { LogOut } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { dataClient } from '../../utils/amplify';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Get or create user profile
      await getOrCreateUserProfile(currentUser.userId);
    } catch (error) {
      console.error('Error loading user:', error);
      router.replace('/(auth)/sign-in');
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateUserProfile = async (userId: string) => {
    try {
      const { data: existingProfile } = await dataClient.models.UserProfile.get({ userId });
      
      if (!existingProfile) {
        const userAttributes = await fetchUserAttributes();
        const email = userAttributes.email || '';
        const username = userAttributes.preferred_username || email.split('@')[0];
        
        const { data: newProfile } = await dataClient.models.UserProfile.create({
          userId,
          email,
          username,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        
        setUserProfile(newProfile);
      } else {
        setUserProfile(existingProfile);
        
        // Update last login
        await dataClient.models.UserProfile.update({
          userId,
          lastLoginAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error managing user profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Toast.show({
        type: 'success',
        text1: 'Signed out',
        text2: 'See you soon!',
      });
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const displayName = userProfile?.username || 'User';
  const displayEmail = userProfile?.email || user?.username || '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>Hello, {displayName}!</Text>
          <Text style={styles.subtitle}>
            Thanks for trying out my{'\n'}Expo Auth demo
          </Text>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>

        {/* Status */}
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Successfully authenticated</Text>
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
        />
      </View>
    </View>
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
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    color: Colors.gray600,
    fontFamily: 'DMSans_400Regular',
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'DMSans_700Bold',
  },
  welcome: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
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
    marginBottom: 16,
  },
  email: {
    fontSize: 14,
    color: Colors.gray500,
    fontFamily: 'DMSans_400Regular',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray50,
    borderRadius: 100,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 14,
    color: Colors.gray700,
    fontFamily: 'DMSans_500Medium',
  },
});
