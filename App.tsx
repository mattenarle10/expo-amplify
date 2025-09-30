import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Amplify } from "aws-amplify";
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser } from "@aws-amplify/auth";
import outputs from "./amplify_outputs.json";

// Configure Amplify with backend resources (Cognito, AppSync, etc.)
Amplify.configure(outputs);

// Define the possible authentication screens
type AuthScreen = "signIn" | "signUp" | "confirmSignUp";

const App = () => {
  const [screen, setScreen] = React.useState<AuthScreen>("signIn");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [user, setUser] = React.useState<any>(null);

  // Check if user is already signed in on app load
  React.useEffect(() => {
    checkUser();
  }, []);

  // Check current authentication status
  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  // Handle user sign-in with USER_PASSWORD_AUTH flow (Expo Go compatible)
  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn({
        username: email.trim(),
        password,
        // USER_PASSWORD_AUTH works in Expo Go (no native modules required)
        // For production with native build, use USER_SRP_AUTH for better security
        options: { authFlowType: "USER_PASSWORD_AUTH" as const },
      });
      await checkUser();
    } catch (e: any) {
      setError(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: { email: email.trim() },
        },
      });
      setScreen("confirmSignUp");
    } catch (e: any) {
      setError(e?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification with OTP code
  const handleConfirmSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code });
      setScreen("signIn");
      setCode("");
    } catch (e: any) {
      setError(e?.message || "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e?.message || "Sign out failed");
    }
  };

  // Authenticated user screen
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.welcomeCard}>
            {/* User avatar with first letter */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.userEmail}>{user.username}</Text>
            <View style={styles.divider} />
            <Text style={styles.statusText}>✓ Successfully authenticated</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Authentication screens (sign in, sign up, verify)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Dynamic title based on current screen */}
          <Text style={styles.title}>
            {screen === "signIn" && "Sign In"}
            {screen === "signUp" && "Create Account"}
            {screen === "confirmSignUp" && "Verify Email"}
          </Text>

          {/* Error message display */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {screen === "confirmSignUp" ? (
            <>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
              <TextInput
                style={styles.input}
                placeholder="Verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleConfirmSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen("signIn")}>
                <Text style={styles.link}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {screen === "signUp" && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={screen === "signIn" ? handleSignIn : handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {screen === "signIn" ? "Sign In" : "Sign Up"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setScreen(screen === "signIn" ? "signUp" : "signIn")
                }
              >
                <Text style={styles.link}>
                  {screen === "signIn"
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: "#f5f5f5",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    width: "100%",
    maxWidth: 400,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 24,
  },
  statusText: {
    fontSize: 14,
    color: "#34C759",
    marginBottom: 24,
    fontWeight: "500",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
  },
});

export default App;