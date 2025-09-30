# Complete Developer Guide

> **Comprehensive documentation for Expo + AWS Amplify Authentication**  
> This guide combines setup instructions, technical details, API reference, and Expo Go modifications.

---

# Expo + AWS Amplify Authentication

A React Native mobile app with email authentication, built with Expo and AWS Amplify Gen 2.

## ✨ Features

- Email/password sign up with OTP verification
- User sign in and sign out
- Session persistence
- Custom UI (no external UI library)
- Works in Expo Go

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: AWS Amplify Gen 2
- **Auth**: Amazon Cognito
- **API**: AWS AppSync GraphQL

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Amplify backend (terminal 1)
npx ampx sandbox --profile <your-aws-profile>

# Start Expo (terminal 2)
npx expo start

# Scan QR code with Expo Go app
```

## 📁 Project Structure

```
expo-amplify/
├── App.tsx                 # Main app with auth UI
├── index.ts                # Entry point with polyfills
├── amplify/
│   ├── auth/resource.ts    # Cognito configuration
│   └── data/resource.ts    # GraphQL schema
└── amplify_outputs.json    # Auto-generated config
```

## 🔑 Key Changes for Expo Go

Amplify's default auth uses SRP (requires native modules). We modified it to work in Expo Go:

1. **Added polyfills** (`index.ts`):
   ```typescript
   import 'react-native-get-random-values';
   import 'react-native-url-polyfill/auto';
   ```

2. **Changed auth flow** to `USER_PASSWORD_AUTH`:
   ```typescript
   await signIn({
     username: email,
     password,
     options: { authFlowType: "USER_PASSWORD_AUTH" }
   });
   ```

3. **Enabled in Cognito**: AWS Console → Cognito → App clients → Enable `ALLOW_USER_PASSWORD_AUTH`

4. **Custom UI**: Built with React Native components instead of Amplify Authenticator

> **For production**: Use a native build with `USER_SRP_AUTH` for better security.

## 📍 View Your Resources

```bash
# User Pool ID
cat amplify_outputs.json | grep user_pool_id

# API Endpoint
cat amplify_outputs.json | grep '"url"'
```

**AWS Console**:
- **Users**: Cognito → User Pools → Your pool → Users tab
- **API**: AppSync → APIs → Your API

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unknown error occurred" | Enable `ALLOW_USER_PASSWORD_AUTH` in Cognito app client |
| Backend changes not showing | Restart sandbox and Expo with `npx expo start -c` |
| Session not persisting | Already handled with AsyncStorage |

## 📚 Documentation

- **Detailed Guide**: See `DEVELOPER_GUIDE.md` for comprehensive documentation
- **API Reference**: See `API_REFERENCE.md` for endpoints and usage
- **Quick Start**: See `QUICK_START.md` for 5-minute setup

## 📖 Learn More

- [AWS Amplify Docs](https://docs.amplify.aws/react-native/)
- [Amplify Auth](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Expo Documentation](https://docs.expo.dev/)

## 📄 License

MIT

---

**Built with Expo and AWS Amplify Gen 2**
# Changes Made for Expo Go Compatibility

This document explains all the modifications we made to get AWS Amplify Auth working in Expo Go.

## 🎯 The Problem

AWS Amplify's default authentication uses **SRP (Secure Remote Password)** protocol, which requires native cryptographic modules that are **not available in Expo Go**. This causes the error:

```
The package '@aws-amplify/react-native' doesn't seem to be linked
```

## ✅ Solutions Implemented

### 1. Added Required Polyfills

**File**: `index.ts`

**What we added**:
```typescript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
```

**Why**:
- Amplify Auth needs `crypto.getRandomValues()` for generating random values
- Amplify needs the `URL` API for parsing endpoints
- React Native doesn't provide these by default
- These polyfills provide JavaScript implementations

**Dependencies added** (in `package.json`):
```json
{
  "react-native-get-random-values": "^1.11.0",
  "react-native-url-polyfill": "^3.0.0"
}
```

### 2. Changed Auth Flow to USER_PASSWORD_AUTH

**File**: `App.tsx`

**What we changed**:
```typescript
// Before (doesn't work in Expo Go)
await signIn({
  username: email,
  password: password,
  // Default: USER_SRP_AUTH (requires native modules)
});

// After (works in Expo Go)
await signIn({
  username: email,
  password: password,
  options: { authFlowType: "USER_PASSWORD_AUTH" as const },
});
```

**Why**:
- `USER_SRP_AUTH` (default) requires native crypto modules
- `USER_PASSWORD_AUTH` is pure JavaScript, works in Expo Go
- Password is sent over HTTPS (still secure in transit)
- For production with native builds, switch back to `USER_SRP_AUTH`

### 3. Enabled USER_PASSWORD_AUTH in Cognito

**Where**: AWS Cognito Console → User Pools → App Clients

**What we enabled**:
- ✅ `ALLOW_USER_PASSWORD_AUTH`
- ✅ `ALLOW_REFRESH_TOKEN_AUTH`

**Why**:
- Cognito app clients have auth flows disabled by default
- Must explicitly enable `USER_PASSWORD_AUTH` flow
- Without this, sign-in fails with "Unknown error occurred"

**How to check**:
1. Go to AWS Console → Cognito → User Pools
2. Select your pool: `amplify-expoamplify-matt-sandbox-...`
3. Click "App clients" → Your client
4. Under "Authentication flows", verify both are checked

### 4. Ensured No Client Secret

**Where**: AWS Cognito Console → User Pools → App Clients

**What we verified**:
- ❌ "Generate client secret" is **OFF**

**Why**:
- Client secrets are for server-side apps
- Mobile apps are "public clients" (can't securely store secrets)
- If a secret exists, Amplify expects it in every request
- This causes "Missing SECRET_HASH" errors

### 5. Created Custom Auth UI

**File**: `App.tsx`

**What we replaced**:
```typescript
// Before (Amplify's built-in UI)
import { Authenticator } from '@aws-amplify/ui-react-native';

<Authenticator>
  <App />
</Authenticator>
```

**After (Custom implementation)**:
```typescript
// Custom sign-in, sign-up, and verification screens
// Built with React Native components
// Full control over UI and auth flow
```

**Why**:
- `@aws-amplify/ui-react-native` Authenticator uses SRP by default
- Has dependencies on native modules
- Custom UI gives us full control over auth flow
- Can explicitly use `USER_PASSWORD_AUTH`
- Better UI/UX customization

### 6. Added Required Dependencies

**File**: `package.json`

**Dependencies added**:
```json
{
  "@aws-amplify/react-native": "^1.2.0",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/netinfo": "^11.4.1",
  "react-native-get-random-values": "^1.11.0",
  "react-native-url-polyfill": "^3.0.0"
}
```

**Why each is needed**:
- `@aws-amplify/react-native`: React Native specific utilities for Amplify
- `@react-native-async-storage/async-storage`: Store auth tokens persistently
- `@react-native-community/netinfo`: Detect network status for offline support
- `react-native-get-random-values`: Crypto polyfill
- `react-native-url-polyfill`: URL API polyfill

## 📋 Complete Checklist

To make Amplify Auth work in Expo Go, you need:

- [x] Install polyfill packages (`react-native-get-random-values`, `react-native-url-polyfill`)
- [x] Import polyfills at app entry point (`index.ts`)
- [x] Use `USER_PASSWORD_AUTH` in all `signIn()` calls
- [x] Enable `ALLOW_USER_PASSWORD_AUTH` in Cognito app client
- [x] Enable `ALLOW_REFRESH_TOKEN_AUTH` in Cognito app client
- [x] Ensure app client has NO client secret
- [x] Install AsyncStorage for token persistence
- [x] Install NetInfo for network detection

## 🔄 Comparison: Before vs After

### Before (Doesn't Work in Expo Go)

```typescript
// index.ts
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);

// App.tsx
import { Authenticator } from '@aws-amplify/ui-react-native';

<Authenticator>
  <YourApp />
</Authenticator>

// Sign in (uses SRP by default)
await signIn({ username, password });
```

**Result**: ❌ Error: "Package '@aws-amplify/react-native' doesn't seem to be linked"

### After (Works in Expo Go)

```typescript
// index.ts
import 'react-native-get-random-values';  // ← Added
import 'react-native-url-polyfill/auto';  // ← Added
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);

// App.tsx
// Custom auth UI with React Native components

// Sign in with explicit auth flow
await signIn({
  username,
  password,
  options: { authFlowType: "USER_PASSWORD_AUTH" }  // ← Added
});
```

**Result**: ✅ Works perfectly in Expo Go

## 🚀 For Production (Native Build)

When you create a native build (not Expo Go), you can switch back to the more secure SRP flow:

### 1. Create Native Build
```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

### 2. Switch to SRP
```typescript
await signIn({
  username: email,
  password: password,
  options: { authFlowType: "USER_SRP_AUTH" }  // More secure
});
```

### 3. Update Cognito
Enable `ALLOW_USER_SRP_AUTH` in your Cognito app client (in addition to or instead of `USER_PASSWORD_AUTH`).

## 🔒 Security Considerations

### USER_PASSWORD_AUTH
- ✅ Works in Expo Go
- ✅ Password sent over HTTPS (encrypted in transit)
- ⚠️ Password reaches AWS servers (even if encrypted)
- ✅ Good for development and testing
- ⚠️ Less secure than SRP for production

### USER_SRP_AUTH (Recommended for Production)
- ❌ Doesn't work in Expo Go
- ✅ Password never leaves device
- ✅ Zero-knowledge proof protocol
- ✅ Most secure option
- ✅ Requires native build

## 📝 Summary

| Change | File | Reason |
|--------|------|--------|
| Add polyfills | `index.ts` | Provide crypto and URL APIs |
| Use USER_PASSWORD_AUTH | `App.tsx` | Avoid native module requirement |
| Custom auth UI | `App.tsx` | Full control over auth flow |
| Enable in Cognito | AWS Console | Allow password-based auth |
| No client secret | AWS Console | Mobile apps are public clients |

## 🎓 What We Learned

1. **Expo Go has limitations** - It's a sandbox that doesn't include all native modules
2. **Amplify is flexible** - Multiple auth flows available for different use cases
3. **Polyfills are essential** - React Native needs JavaScript implementations of web APIs
4. **Cognito is configurable** - Must explicitly enable auth flows you want to use
5. **Custom UI gives control** - Sometimes better than pre-built components

## 🔗 Related Documentation

- [Amplify Auth for React Native](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Cognito User Pool Auth Flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html)
- [Expo Go Limitations](https://docs.expo.dev/workflow/expo-go/)
- [SRP Protocol](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol)

---

**Key Takeaway**: Expo Go is great for rapid development, but for production apps with full security, create a native build and use SRP authentication.
# API Reference & Endpoints

## 🔗 Your Deployed Resources

### AppSync GraphQL API
- **Endpoint**: `https://xwg4g6sgofewlg7dkufdvt2zpa.appsync-api.ap-southeast-1.amazonaws.com/graphql`
- **Region**: `ap-southeast-1` (Singapore)
- **Authorization**: Cognito User Pools (primary), AWS IAM (secondary)

### Cognito User Pool
- **User Pool ID**: `ap-southeast-1_qZi8VSvJa`
- **App Client ID**: `5rup3ml2ev6h39vnk7i12pf46k`
- **Identity Pool ID**: `ap-southeast-1:fe8fbd5a-1158-46a6-8d07-b7f878a93104`
- **Region**: `ap-southeast-1`

## 📍 Where to Find Your Resources

### AWS Console

1. **Cognito User Pool**
   - Navigate to: AWS Console → Cognito → User Pools
   - Pool Name: `amplify-expoamplify-matt-sandbox-07de79615d`
   - View users, app clients, and settings

2. **AppSync API**
   - Navigate to: AWS Console → AppSync → APIs
   - API Name: Your sandbox API
   - View schema, queries, and data sources

3. **DynamoDB Tables**
   - Navigate to: AWS Console → DynamoDB → Tables
   - Tables are auto-created for each model in your schema
   - Example: `Todo-<random-id>` table

### Local Configuration

All endpoints and IDs are in `amplify_outputs.json`:

```bash
# View all config
cat amplify_outputs.json | jq

# Get API endpoint
cat amplify_outputs.json | jq -r '.data.url'

# Get User Pool ID
cat amplify_outputs.json | jq -r '.auth.user_pool_id'

# Get App Client ID
cat amplify_outputs.json | jq -r '.auth.user_pool_client_id'
```

## 🔐 Authentication Endpoints

### Sign Up
```typescript
import { signUp } from '@aws-amplify/auth';

await signUp({
  username: 'user@example.com',
  password: 'SecurePass123!',
  options: {
    userAttributes: {
      email: 'user@example.com'
    }
  }
});
```

### Confirm Sign Up
```typescript
import { confirmSignUp } from '@aws-amplify/auth';

await confirmSignUp({
  username: 'user@example.com',
  confirmationCode: '123456'
});
```

### Sign In
```typescript
import { signIn } from '@aws-amplify/auth';

await signIn({
  username: 'user@example.com',
  password: 'SecurePass123!',
  options: {
    authFlowType: 'USER_PASSWORD_AUTH' // For Expo Go
  }
});
```

### Sign Out
```typescript
import { signOut } from '@aws-amplify/auth';

await signOut();
```

### Get Current User
```typescript
import { getCurrentUser } from '@aws-amplify/auth';

const user = await getCurrentUser();
console.log(user.username, user.userId);
```

## 📊 Data API (GraphQL)

### Schema (from `amplify/data/resource.ts`)

```graphql
type Todo @model @auth(rules: [{ allow: public, provider: iam }]) {
  id: ID!
  content: String
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### Using the Data Client

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';

const client = generateClient<Schema>();

// Create a todo
const { data: newTodo } = await client.models.Todo.create({
  content: 'Buy groceries'
});

// List all todos
const { data: todos } = await client.models.Todo.list();

// Get a specific todo
const { data: todo } = await client.models.Todo.get({ id: 'todo-id' });

// Update a todo
const { data: updatedTodo } = await client.models.Todo.update({
  id: 'todo-id',
  content: 'Buy groceries and cook dinner'
});

// Delete a todo
await client.models.Todo.delete({ id: 'todo-id' });
```

### Direct GraphQL Queries

If you prefer raw GraphQL:

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

## 🧪 Testing Your API

### Using AWS AppSync Console

1. Go to AWS Console → AppSync → Your API
2. Click "Queries" in the left sidebar
3. Run test queries:

```graphql
# Create a todo
mutation CreateTodo {
  createTodo(input: { content: "Test todo" }) {
    id
    content
    createdAt
  }
}

# List todos
query ListTodos {
  listTodos {
    items {
      id
      content
      createdAt
    }
  }
}
```

### Using cURL

```bash
# Get your API endpoint
API_ENDPOINT="https://xwg4g6sgofewlg7dkufdvt2zpa.appsync-api.ap-southeast-1.amazonaws.com/graphql"

# You'll need an API key or auth token
# For IAM auth, use AWS signature v4

# Example with API key (if you add one)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"query":"query { listTodos { items { id content } } }"}' \
  $API_ENDPOINT
```

### Using Postman

1. Create a new POST request
2. URL: `https://xwg4g6sgofewlg7dkufdvt2zpa.appsync-api.ap-southeast-1.amazonaws.com/graphql`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: <your-cognito-token>` (get from app after sign-in)
4. Body (raw JSON):
```json
{
  "query": "query { listTodos { items { id content } } }"
}
```

## 🔍 Viewing Data in AWS Console

### DynamoDB Tables

1. Go to AWS Console → DynamoDB → Tables
2. Find your table (e.g., `Todo-<random-id>`)
3. Click "Explore table items"
4. View, edit, or delete items directly

### Cognito Users

1. Go to AWS Console → Cognito → User Pools
2. Select your pool: `amplify-expoamplify-matt-sandbox-07de79615d`
3. Click "Users" tab
4. See all registered users, their status, and attributes

## 📱 Getting Auth Tokens in Your App

```typescript
import { fetchAuthSession } from '@aws-amplify/auth';

// Get current session with tokens
const session = await fetchAuthSession();

console.log('ID Token:', session.tokens?.idToken?.toString());
console.log('Access Token:', session.tokens?.accessToken?.toString());
console.log('Refresh Token:', session.tokens?.refreshToken?.toString());

// Use the ID token for AppSync requests
const idToken = session.tokens?.idToken?.toString();

// Make authenticated GraphQL request
const response = await fetch(
  'https://xwg4g6sgofewlg7dkufdvt2zpa.appsync-api.ap-southeast-1.amazonaws.com/graphql',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': idToken || ''
    },
    body: JSON.stringify({
      query: 'query { listTodos { items { id content } } }'
    })
  }
);
```

## 🛠️ Modifying Your Schema

### Add a New Model

Edit `amplify/data/resource.ts`:

```typescript
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  // Add new model
  Note: a
    .model({
      title: a.string().required(),
      body: a.string(),
      userId: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner(), // Only owner can CRUD
    ]),
});
```

### Deploy Changes

The sandbox auto-deploys when you save:

```bash
# If sandbox is running, it will detect changes
# Otherwise, start it:
npx ampx sandbox --profile admin-golong

# Wait for: "✔ Deployment completed"
# New amplify_outputs.json will be generated
```

## 📚 Additional Resources

- **Amplify Data Docs**: https://docs.amplify.aws/react-native/build-a-backend/data/
- **GraphQL API Docs**: https://docs.amplify.aws/react-native/build-a-backend/data/query-data/
- **Auth Docs**: https://docs.amplify.aws/react-native/build-a-backend/auth/
- **AppSync Docs**: https://docs.aws.amazon.com/appsync/
- **Cognito Docs**: https://docs.aws.amazon.com/cognito/

## 🚨 Important Notes

1. **Sandbox is for development only** - Data is deleted when sandbox is stopped
2. **User data persists** - Cognito users remain until manually deleted
3. **API endpoint changes** - If you recreate the sandbox, the endpoint URL will change
4. **Authorization** - Current setup uses IAM for public access; consider using Cognito User Pools for production

---

**Last Updated**: Based on sandbox deployment at 12:54:03 PM, 2025-09-30
