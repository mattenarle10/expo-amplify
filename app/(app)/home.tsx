import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, fetchUserAttributes, signOut, updateUserAttribute } from '@aws-amplify/auth';
import { Edit3 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { dataClient } from '../../utils/amplify';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleEditUsername = () => {
    setNewUsername(userProfile?.username || '');
    setShowEditModal(true);
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === userProfile?.username) {
      setShowEditModal(false);
      return;
    }

    setUpdating(true);
    try {
      // Update in Cognito
      await updateUserAttribute({
        userAttribute: {
          attributeKey: 'preferred_username',
          value: newUsername.trim(),
        },
      });

      // Update in DynamoDB
      await dataClient.models.UserProfile.update({
        userId: user.userId,
        username: newUsername.trim(),
      });

      // Refresh profile
      const { data: updatedProfile } = await dataClient.models.UserProfile.get({ 
        userId: user.userId 
      });
      setUserProfile(updatedProfile);

      Toast.show({
        type: 'success',
        text1: 'Username updated!',
        text2: `Your new username is ${newUsername.trim()}`,
      });

      setShowEditModal(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: error.message || 'Please try again',
      });
    } finally {
      setUpdating(false);
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
        <View style={styles.loadingContainer}>
          {/* Animated skeleton avatar */}
          <View style={styles.skeletonAvatar}>
            <ActivityIndicator size="large" color={Colors.black} />
          </View>
          
          {/* Loading text */}
          <Text style={styles.loadingText}>Loading your profile...</Text>
          
          {/* Skeleton text lines */}
          <View style={styles.skeletonTextContainer}>
            <View style={[styles.skeletonText, { width: '60%' }]} />
            <View style={[styles.skeletonText, { width: '80%' }]} />
            <View style={[styles.skeletonText, { width: '40%' }]} />
          </View>
        </View>
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
          <View style={styles.usernameRow}>
            <Text style={styles.greeting}>Hello, {displayName}!</Text>
            <TouchableOpacity onPress={handleEditUsername} style={styles.editButton}>
              <Edit3 size={20} color={Colors.gray600} />
            </TouchableOpacity>
          </View>
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

      {/* Edit Username Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Username"
      >
        <View style={styles.modalContent}>
          <Input
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter new username"
            autoCapitalize="none"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!newUsername.trim() || newUsername === userProfile?.username) && styles.saveButtonDisabled
              ]}
              onPress={handleUpdateUsername}
              disabled={!newUsername.trim() || newUsername === userProfile?.username || updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray600,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 32,
  },
  skeletonTextContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    gap: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.gray200,
    borderRadius: 8,
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.gray100,
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
  modalContent: {
    gap: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray700,
    fontFamily: 'DMSans_600SemiBold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'DMSans_600SemiBold',
  },
});
