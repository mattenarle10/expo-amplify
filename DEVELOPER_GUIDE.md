# Complete Developer Guide

> **Step-by-step guide to building an Expo + AWS Amplify Authentication app**  
> Follow this narrative to understand how we built this project from scratch.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Initial Setup](#2-initial-setup)
3. [Backend Configuration](#3-backend-configuration)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Expo Go Compatibility](#5-expo-go-compatibility)
6. [Testing & Debugging](#6-testing--debugging)
7. [Deployment](#7-deployment)
8. [API Usage](#8-api-usage)

---

## 1. Project Overview

### What We're Building

A React Native mobile app with email-based authentication that:
- Allows users to sign up with email/password
- Sends OTP codes for email verification
- Handles sign in and sign out
- Persists user sessions
- Works in Expo Go (no native build required for development)

### Tech Stack

- **Frontend**: React Native with Expo (~54.0.10), TypeScript
- **Backend**: AWS Amplify Gen 2
- **Authentication**: Amazon Cognito User Pools
- **API**: AWS AppSync GraphQL
- **Storage**: AsyncStorage for session persistence

---

## 2. Initial Setup

### Step 1: Create Expo Project

```bash
# Create new Expo project
npx create-expo-app expo-amplify --template blank-typescript

# Navigate to project
cd expo-amplify
```

### Step 2: Install Dependencies

```bash
# Install Amplify packages
npm install aws-amplify @aws-amplify/react-native

# Install required React Native packages
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-get-random-values
npm install react-native-url-polyfill

# Install dev dependencies
npm install --save-dev @aws-amplify/backend @aws-amplify/backend-cli
```

**What each package does**:
- `aws-amplify` - Core Amplify library
- `@aws-amplify/react-native` - React Native specific utilities
- `@react-native-async-storage/async-storage` - Store auth tokens
- `@react-native-community/netinfo` - Network status detection
- `react-native-get-random-values` - Crypto polyfill
- `react-native-url-polyfill` - URL API polyfill

---

## 3. Backend Configuration

### Step 3: Initialize Amplify Backend

```bash
# Initialize Amplify Gen 2
npx ampx init
```

This creates:
- `amplify/` directory for backend configuration
- `amplify/backend.ts` - main backend definition
- `amplify/auth/resource.ts` - authentication configuration
- `amplify/data/resource.ts` - GraphQL API schema

### Step 4: Configure Authentication

Edit `amplify/auth/resource.ts`:

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,  // Use email as username
  },
  userAttributes: {
    email: {
      required: true,
    },
  },
});
```

**What this configures**:
- Email-based authentication (email is the username)
- Email verification required
- Password policy: min 8 chars, uppercase, lowercase, numbers, symbols
- Creates a Cognito User Pool when deployed

### Step 5: Configure Data API (Optional)

Edit `amplify/data/resource.ts`:

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
```

**What this creates**:
- GraphQL API with AWS AppSync
- DynamoDB table for Todo items
- Auto-generated queries and mutations

### Step 6: Deploy Backend (Sandbox Mode)

```bash
# Start sandbox (development environment)
npx ampx sandbox --profile <your-aws-profile>
```

**What happens during deployment**:
1. ✅ Creates Amazon Cognito User Pool
2. ✅ Creates Cognito Identity Pool
3. ✅ Deploys AWS AppSync GraphQL API
4. ✅ Creates DynamoDB tables
5. ✅ Generates `amplify_outputs.json` with all configuration

**Important Notes**:
- Keep this terminal running - sandbox watches for file changes
- Sandbox is for development only - data is temporary
- User accounts persist until manually deleted
- `amplify_outputs.json` is auto-generated (add to `.gitignore`)

---

## 4. Frontend Implementation

### Step 7: Add Polyfills (Critical for React Native)

Edit `index.ts`:

```typescript
// IMPORTANT: These MUST be imported FIRST, before anything else
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

**Why this is necessary**:
- React Native doesn't provide `crypto.getRandomValues()` API
- React Native doesn't provide `URL` API
- Amplify Auth requires both of these
- These polyfills provide JavaScript implementations

### Step 8: Configure Amplify in Your App

Edit `App.tsx`:

```typescript
import React from 'react';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

// Configure Amplify with backend resources
Amplify.configure(outputs);
```

**What `amplify_outputs.json` contains**:
- Cognito User Pool ID and region
- App Client ID
- Identity Pool ID
- AppSync API endpoint
- Authorization settings

### Step 9: Build Custom Auth UI

Create authentication screens in `App.tsx`:

```typescript
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser } from '@aws-amplify/auth';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);

type AuthScreen = 'signIn' | 'signUp' | 'confirmSignUp';

const App = () => {
  const [screen, setScreen] = React.useState<AuthScreen>('signIn');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState<any>(null);

  // Check if user is already signed in on app load
  React.useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const handleSignUp = async () => {
    setError('');
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
      setScreen('confirmSignUp');
    } catch (e: any) {
      setError(e?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: code,
      });
      setScreen('signIn');
      setCode('');
    } catch (e: any) {
      setError(e?.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn({
        username: email.trim(),
        password,
        // USER_PASSWORD_AUTH works in Expo Go
        options: { authFlowType: 'USER_PASSWORD_AUTH' as const },
      });
      await checkUser();
    } catch (e: any) {
      setError(e?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e?.message || 'Sign out failed');
    }
  };

  // Render authenticated user screen
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.welcomeCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
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

  // Render authentication screens (sign in, sign up, verify)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {screen === 'signIn' && 'Sign In'}
            {screen === 'signUp' && 'Create Account'}
            {screen === 'confirmSignUp' && 'Verify Email'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {screen === 'confirmSignUp' ? (
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
              <TouchableOpacity onPress={() => setScreen('signIn')}>
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
              {screen === 'signUp' && (
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
                onPress={screen === 'signIn' ? handleSignIn : handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {screen === 'signIn' ? 'Sign In' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScreen(screen === 'signIn' ? 'signUp' : 'signIn')}
              >
                <Text style={styles.link}>
                  {screen === 'signIn'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Add styles (see full App.tsx for complete styles)
const styles = StyleSheet.create({
  // ... styles
});

export default App;
```

**Key Implementation Points**:
- Three screens: Sign In, Sign Up, Verify Email
- Form validation (password matching)
- Loading states with spinners
- Error handling with user-friendly messages
- Session persistence (automatic via AsyncStorage)
- Clean, modern UI with proper keyboard handling

---

## 5. Expo Go Compatibility

### The Problem We Faced

AWS Amplify's default authentication uses **SRP (Secure Remote Password)** protocol, which requires native cryptographic modules. These modules are **not available in Expo Go**, causing this error:

```
The package '@aws-amplify/react-native' doesn't seem to be linked
```

### Our Solution: Four Key Changes

#### Change 1: Added Polyfills

In `index.ts`:
```typescript
import 'react-native-get-random-values';  // Crypto polyfill
import 'react-native-url-polyfill/auto';  // URL API polyfill
```

**Why**: Provides JavaScript implementations of crypto and URL APIs that Amplify needs.

#### Change 2: Changed Auth Flow

In `App.tsx`:
```typescript
await signIn({
  username: email,
  password,
  options: { authFlowType: 'USER_PASSWORD_AUTH' }  // ← Key change
});
```

**Comparison**:
- **Default**: `USER_SRP_AUTH` (requires native modules, doesn't work in Expo Go)
- **Changed to**: `USER_PASSWORD_AUTH` (pure JavaScript, works in Expo Go)

#### Change 3: Enabled in AWS Cognito

**Steps to enable in AWS Console**:
1. Navigate to AWS Console → Cognito → User Pools
2. Select your user pool (name starts with `amplify-expoamplify-...`)
3. Click "App clients" tab
4. Click on your app client
5. Under "Authentication flows", enable:
   - ✅ `ALLOW_USER_PASSWORD_AUTH`
   - ✅ `ALLOW_REFRESH_TOKEN_AUTH`
6. Verify "Generate client secret" is **OFF** (must be public client for mobile)
7. Click "Save changes"

**Why this is required**: Cognito app clients have auth flows disabled by default. You must explicitly enable the flows you want to use.

#### Change 4: Built Custom UI

Instead of using `@aws-amplify/ui-react-native` Authenticator (which uses SRP and has native dependencies), we built custom screens with React Native components.

**Benefits**:
- Full control over UI/UX
- Can explicitly specify auth flow
- No native module dependencies
- Works perfectly in Expo Go

### Security Considerations

**Development (Expo Go)**:
- ✅ Uses `USER_PASSWORD_AUTH`
- ✅ Password sent over HTTPS (encrypted in transit)
- ✅ Good for development and testing
- ⚠️ Password reaches AWS servers (even if encrypted)

**Production (Native Build)**:
- ✅ Use `USER_SRP_AUTH`
- ✅ Password never leaves device
- ✅ Zero-knowledge proof protocol
- ✅ Most secure option
- ⚠️ Requires native build (not Expo Go)

---

## 6. Testing & Debugging

### Step 10: Start Development Server

```bash
# In a new terminal (sandbox should still be running in terminal 1)
npx expo start
```

### Step 11: Test on Device

1. Open Expo Go app on your phone
2. Scan the QR code from the terminal
3. App loads on your device

### Step 12: Test Authentication Flow

**Test Sign Up**:
1. Tap "Don't have an account? Sign Up"
2. Enter email and password (must meet password policy)
3. Confirm password
4. Tap "Sign Up"
5. Check your email for verification code
6. Enter the 6-digit code
7. Tap "Verify"
8. Redirected to sign-in screen

**Test Sign In**:
1. Enter the same email and password
2. Tap "Sign In"
3. See welcome screen with your email

**Test Sign Out**:
1. Tap "Sign Out" button
2. Return to sign-in screen
3. Session cleared

**Test Session Persistence**:
1. Sign in
2. Close the app completely
3. Reopen the app
4. Should still be signed in (session restored)

### Viewing Backend Resources

**Check your configuration**:
```bash
# View User Pool ID
cat amplify_outputs.json | jq -r '.auth.user_pool_id'

# View App Client ID
cat amplify_outputs.json | jq -r '.auth.user_pool_client_id'

# View API Endpoint
cat amplify_outputs.json | jq -r '.data.url'

# View Region
cat amplify_outputs.json | jq -r '.auth.aws_region'
```

**View users in AWS Console**:
1. Go to AWS Console → Cognito
2. Click "User Pools"
3. Select your pool (starts with `amplify-expoamplify-...`)
4. Click "Users" tab
5. See all registered users, their email, and verification status

**View API in AWS Console**:
1. Go to AWS Console → AppSync
2. Click "APIs"
3. Select your API
4. View schema, queries, and test in the console

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unknown error occurred" after OTP | Auth flow not enabled in Cognito | Enable `ALLOW_USER_PASSWORD_AUTH` in app client settings |
| "Package not linked" error | Using SRP in Expo Go | Already fixed - we use `USER_PASSWORD_AUTH` |
| "Missing SECRET_HASH" error | App client has client secret | Ensure "Generate client secret" is OFF in Cognito |
| Backend changes not showing | Sandbox not running or not deployed | Restart sandbox, wait for deployment, then restart Expo with `-c` flag |
| Session not persisting | AsyncStorage not configured | Already handled - `@react-native-async-storage/async-storage` installed |
| Password policy error | Password doesn't meet requirements | Min 8 chars, must have uppercase, lowercase, number, symbol |

### Debugging Tips

**Enable verbose logging**:
```typescript
// Add to App.tsx for debugging
console.log('Auth state:', { user, screen, email });
```

**Check sandbox logs**:
- Watch the terminal where sandbox is running
- Shows deployment status and errors

**Clear Metro cache**:
```bash
npx expo start -c
```

---

## 7. Deployment

### For Production

#### Step 13: Create Native Build

```bash
# Generate native iOS and Android projects
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

**Why create a native build**:
- Access to all native modules
- Can use more secure `USER_SRP_AUTH` flow
- Better performance
- Required for App Store/Play Store submission

#### Step 14: Switch to SRP (Recommended for Production)

In `App.tsx`, change the auth flow:
```typescript
await signIn({
  username: email,
  password,
  options: { authFlowType: 'USER_SRP_AUTH' }  // More secure
});
```

**Enable in Cognito**:
1. AWS Console → Cognito → User Pools → App clients
2. Enable `ALLOW_USER_SRP_AUTH`
3. Keep `ALLOW_REFRESH_TOKEN_AUTH` enabled
4. Save changes

#### Step 15: Deploy Backend to Production

```bash
# Deploy via Amplify pipeline
npx ampx pipeline-deploy --branch main --app-id <your-amplify-app-id>
```

**Production deployment creates**:
- Persistent backend (not temporary like sandbox)
- Production-grade infrastructure
- Separate environments (dev, staging, prod)

---

## 8. API Usage

### Authentication APIs

**Get Current User**:
```typescript
import { getCurrentUser } from '@aws-amplify/auth';

const user = await getCurrentUser();
console.log('User ID:', user.userId);
console.log('Username:', user.username);
```

**Get Auth Session & Tokens**:
```typescript
import { fetchAuthSession } from '@aws-amplify/auth';

const session = await fetchAuthSession();
const idToken = session.tokens?.idToken?.toString();
const accessToken = session.tokens?.accessToken?.toString();
const refreshToken = session.tokens?.refreshToken?.toString();

console.log('ID Token:', idToken);
```

**Sign Out**:
```typescript
import { signOut } from '@aws-amplify/auth';

// Sign out from current device
await signOut();

// Sign out from all devices
await signOut({ global: true });
```

### GraphQL API (Data)

**Using Generated Client**:
```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';

const client = generateClient<Schema>();

// Create a todo
const { data: newTodo, errors } = await client.models.Todo.create({
  content: 'Buy groceries'
});

// List all todos
const { data: todos } = await client.models.Todo.list();

// Get a specific todo
const { data: todo } = await client.models.Todo.get({
  id: 'todo-id-here'
});

// Update a todo
const { data: updatedTodo } = await client.models.Todo.update({
  id: 'todo-id-here',
  content: 'Buy groceries and cook dinner'
});

// Delete a todo
await client.models.Todo.delete({
  id: 'todo-id-here'
});
```

**Using Raw GraphQL**:
```typescript
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// List todos
const result = await client.graphql({
  query: `
    query ListTodos {
      listTodos {
        items {
          id
          content
          createdAt
        }
      }
    }
  `
});

// Create todo
const createResult = await client.graphql({
  query: `
    mutation CreateTodo($input: CreateTodoInput!) {
      createTodo(input: $input) {
        id
        content
      }
    }
  `,
  variables: {
    input: {
      content: 'New todo item'
    }
  }
});
```

### Finding Your Endpoints

All configuration is in `amplify_outputs.json` (auto-generated, don't commit to git):

```bash
# View all config (formatted)
cat amplify_outputs.json | jq

# Get specific values
cat amplify_outputs.json | jq -r '.auth.user_pool_id'
cat amplify_outputs.json | jq -r '.auth.user_pool_client_id'
cat amplify_outputs.json | jq -r '.auth.identity_pool_id'
cat amplify_outputs.json | jq -r '.data.url'
cat amplify_outputs.json | jq -r '.auth.aws_region'
```

**AWS Console Locations**:
- **Users**: Cognito → User Pools → Your pool → Users tab
- **API**: AppSync → APIs → Your API → Queries
- **Tables**: DynamoDB → Tables → Your table → Items

---

## Project Structure

```
expo-amplify/
├── App.tsx                      # Main app with custom auth UI
├── index.ts                     # Entry point with polyfills
├── amplify_outputs.json         # Auto-generated config (gitignored)
├── amplify/
│   ├── backend.ts              # Backend definition
│   ├── auth/
│   │   └── resource.ts         # Cognito auth configuration
│   └── data/
│       └── resource.ts         # GraphQL API schema
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── .gitignore                  # Git ignore (includes amplify_outputs.json)
└── README.md                   # Project documentation
```

---

## Key Takeaways

### What We Learned

1. **Expo Go has limitations** - Not all native modules are available in the sandbox environment
2. **Amplify is flexible** - Provides multiple auth flows for different use cases
3. **Cognito is configurable** - Must explicitly enable auth flows in app client settings
4. **Custom UI gives control** - Sometimes better than pre-built components for specific requirements
5. **Security matters** - Choose auth flow based on environment (dev vs prod)

### Best Practices

- ✅ Use `USER_PASSWORD_AUTH` for Expo Go development
- ✅ Switch to `USER_SRP_AUTH` for production native builds
- ✅ Keep sandbox running during active development
- ✅ Use `amplify_outputs.json` for all configuration (never hardcode)
- ✅ Add `amplify_outputs.json` to `.gitignore`
- ✅ Never commit AWS credentials or sensitive IDs to version control
- ✅ Test authentication flows thoroughly before production
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Implement proper loading states for better UX
- ✅ Use TypeScript for type safety

### Security Best Practices

**Auth Flow Comparison**:

| Feature | USER_PASSWORD_AUTH | USER_SRP_AUTH |
|---------|-------------------|---------------|
| Expo Go Support | ✅ Yes | ❌ No (requires native) |
| Password Security | ⚠️ Sent over HTTPS | ✅ Never leaves device |
| Implementation | Simple | Moderate |
| Best For | Development/Testing | Production |
| Setup Time | Fast | Requires native build |

**Recommendations**:
- Development: Use `USER_PASSWORD_AUTH` in Expo Go
- Production: Use `USER_SRP_AUTH` with native build
- Always use HTTPS (handled automatically by Amplify)
- Enable MFA for sensitive applications
- Implement proper session timeout
- Use refresh tokens appropriately

---


### Official Documentation

- [AWS Amplify for React Native](https://docs.amplify.aws/react-native/) - Main documentation
- [Amplify Authentication](https://docs.amplify.aws/react-native/build-a-backend/auth/) - Auth setup and usage
- [Amplify Data (GraphQL)](https://docs.amplify.aws/react-native/build-a-backend/data/) - Data API and GraphQL
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/) - Cognito User Pools documentation
- [AWS AppSync](https://docs.aws.amazon.com/appsync/) - GraphQL API documentation
- [Expo Documentation](https://docs.expo.dev/) - Expo framework docs
- [React Native](https://reactnative.dev/) - React Native docs


### Community & Support

- [Amplify Discord](https://discord.gg/amplify) - Community support
- [Amplify GitHub](https://github.com/aws-amplify) - Source code and issues
- [Expo Forums](https://forums.expo.dev/) - Expo community
- [Stack Overflow](https://stackoverflow.com/questions/tagged/aws-amplify) - Q&A
