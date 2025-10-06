# Building Expo Auth with AWS Amplify Gen 2

> **The story of how we got AWS Amplify authentication working in Expo Go**—and the gotchas we solved along the way.

## What We're Building

A production-ready React Native auth system:
- 📧 Email/password sign up with OTP verification
- 🔐 Secure sign in with session persistence
- 📱 Works in **Expo Go** (no native build needed for dev)
- ☁️ Powered by AWS Cognito + AppSync + DynamoDB

**Stack**: Expo 54 · React Native · TypeScript · AWS Amplify Gen 2

---

## Setup (5 minutes)

```bash
# 1. Create project
npx create-expo-app expo-amplify --template blank-typescript && cd expo-amplify

# 2. Install everything
npm install aws-amplify @aws-amplify/react-native \
  @react-native-async-storage/async-storage \
  @react-native-community/netinfo \
  react-native-get-random-values \
  react-native-url-polyfill

npm install --save-dev @aws-amplify/backend @aws-amplify/backend-cli
```

**Why these packages?**
- `react-native-get-random-values` + `react-native-url-polyfill` → Polyfills for crypto/URL APIs (required!)
- `async-storage` → Session persistence
- `netinfo` → Network detection

---

## Backend Setup (AWS Amplify Gen 2)

```bash
npx ampx init  # Creates amplify/ directory
```

**Configure auth** in `amplify/auth/resource.ts`:
```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: { email: { required: true } },
});
```

**Deploy to sandbox**:
```bash
npx ampx sandbox --profile <your-aws-profile>
```

This spins up:
- ✅ Cognito User Pool (auth)
- ✅ AppSync GraphQL API
- ✅ DynamoDB tables
- ✅ Generates `amplify_outputs.json` (gitignore this!)

> **Keep sandbox running** in a terminal—it watches for changes and auto-deploys.

---

## Frontend Setup

### 1. Add Polyfills (Critical!)

In `index.ts`, **import these FIRST**:
```typescript
import 'react-native-get-random-values';  // Crypto polyfill
import 'react-native-url-polyfill/auto';  // URL polyfill

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

> React Native lacks `crypto` and `URL` APIs—Amplify needs them.

### 2. Configure Amplify

In `App.tsx`:
```typescript
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);  // Auto-generated config
```

### 3. Build Auth Screens

```typescript
import { signIn, signUp, confirmSignUp, getCurrentUser } from '@aws-amplify/auth';

// Sign up
await signUp({
  username: email,
  password,
  options: { userAttributes: { email } },
});

// Verify OTP
await confirmSignUp({ username: email, confirmationCode: code });

// Sign in (key: specify USER_PASSWORD_AUTH for Expo Go!)
await signIn({
  username: email,
  password,
  options: { authFlowType: 'USER_PASSWORD_AUTH' },  // ← Critical!
});

// Check session
const user = await getCurrentUser();
```

> See the full UI implementation in the repo's `App.tsx`.

---

## 🚨 The Expo Go Problem (And How We Fixed It)

### The Issue

Amplify's default auth uses **SRP (Secure Remote Password)**—a protocol that requires native crypto modules. Expo Go doesn't have these, so you get:

```
Error: The package '@aws-amplify/react-native' doesn't seem to be linked
```

### The Fix (3 Steps)

#### 1. Use `USER_PASSWORD_AUTH` Flow

```typescript
await signIn({
  username: email,
  password,
  options: { authFlowType: 'USER_PASSWORD_AUTH' },  // Pure JS, works in Expo Go
});
```

| Flow | Expo Go? | Security | Use Case |
|------|----------|----------|----------|
| `USER_SRP_AUTH` | ❌ No | 🔒 Best (password never leaves device) | Production |
| `USER_PASSWORD_AUTH` | ✅ Yes | ⚠️ Good (HTTPS encrypted) | Development |

#### 2. Enable in AWS Cognito

AWS Console → Cognito → User Pools → Your Pool → App clients → Authentication flows:
- ✅ Enable `ALLOW_USER_PASSWORD_AUTH`
- ✅ Enable `ALLOW_REFRESH_TOKEN_AUTH`
- ⚠️ Ensure "Generate client secret" is **OFF**

#### 3. Add Polyfills (Already Done!)

The polyfills we installed earlier provide the crypto/URL APIs Amplify needs.

### Security Note

- **Dev (Expo Go)**: `USER_PASSWORD_AUTH` is fine—password sent over HTTPS
- **Prod (Native)**: Switch to `USER_SRP_AUTH` for zero-knowledge proof security

---

## Testing

```bash
npx expo start  # New terminal (sandbox still running)
# Scan QR → Open in Expo Go
```

**Test flow**:
1. Sign up with email/password
2. Check email for OTP code
3. Verify → Sign in
4. Close app → Reopen → Still signed in ✨

### Common Issues

| Error | Fix |
|-------|-----|
| "Unknown error after OTP" | Enable `ALLOW_USER_PASSWORD_AUTH` in Cognito |
| "Package not linked" | Use `USER_PASSWORD_AUTH` flow (not SRP) |
| "Missing SECRET_HASH" | Turn OFF "Generate client secret" in Cognito |
| Backend changes not showing | Restart sandbox + `npx expo start -c` |

**View users**: AWS Console → Cognito → User Pools → Your pool → Users

---

## Production Deployment

### 1. Create Native Build

```bash
npx expo prebuild      # Generate native projects
npx expo run:ios       # or run:android
```

### 2. Switch to SRP Auth (More Secure)

```typescript
await signIn({
  username: email,
  password,
  options: { authFlowType: 'USER_SRP_AUTH' },  // Password never leaves device
});
```

Enable in Cognito: `ALLOW_USER_SRP_AUTH` + `ALLOW_REFRESH_TOKEN_AUTH`

### 3. Deploy Backend

```bash
npx ampx pipeline-deploy --branch main --app-id <your-app-id>
```

This creates persistent infrastructure (vs. temporary sandbox).

---

## API Quick Reference

### Auth APIs

```typescript
import { getCurrentUser, fetchAuthSession, signOut } from '@aws-amplify/auth';

// Get user
const user = await getCurrentUser();

// Get tokens
const session = await fetchAuthSession();
const idToken = session.tokens?.idToken?.toString();

// Sign out
await signOut();                  // Current device
await signOut({ global: true });  // All devices
```

### GraphQL API

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';

const client = generateClient<Schema>();

// CRUD operations
await client.models.Todo.create({ content: 'Buy groceries' });
await client.models.Todo.list();
await client.models.Todo.update({ id, content: 'Updated' });
await client.models.Todo.delete({ id });
```

---

## Key Takeaways

**What we learned**:
1. Expo Go doesn't support native crypto modules → Use `USER_PASSWORD_AUTH`
2. Cognito auth flows must be explicitly enabled in AWS Console
3. Custom UI gives more control than pre-built Authenticator components
4. Choose auth flow based on environment (dev vs. prod)

**Best practices**:
- ✅ Dev: `USER_PASSWORD_AUTH` in Expo Go
- ✅ Prod: `USER_SRP_AUTH` with native build
- ✅ Never commit `amplify_outputs.json`
- ✅ Handle errors gracefully
- ✅ Test thoroughly before production

---

## Resources

- [AWS Amplify Docs](https://docs.amplify.aws/react-native/)
- [Amplify Auth Guide](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Expo Documentation](https://docs.expo.dev/)
- [Amplify Discord](https://discord.gg/amplify)
