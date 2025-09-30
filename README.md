# Seamless Auth in Expo Go: Powered by AWS Amplify Gen 2

A React Native mobile app with email authentication, built with Expo and AWS Amplify Gen 2. 👾

## Features

- Email/password sign up with OTP verification
- User sign in and sign out
- Session persistence
- Works in Expo Go

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: AWS Amplify Gen 2
- **Auth**: Amazon Cognito
- **API**: AWS AppSync GraphQL
- **Storage**: AWS DynamoDB

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Amplify backend 
npx ampx sandbox --profile <your-aws-profile>

# Start Expo 
npx expo start

# Scan QR code with Expo Go app
```

## 📁 Project Structure

```
expo-amplify/
├── app/(app)/home.tsx           # Expo Router app directory
├── app/(auth)                   # Auth routes
├── app/(auth)/sign-in.tsx       # Sign in page
├── app/(auth)/sign-up.tsx       # Sign up page
├── index.ts             
├── amplify/
│   ├── auth/resource.ts    # Cognito configuration
│   ├── auth/post-confirmation/handler.ts  
│   ├── auth/post-confirmation/resource.ts 
│   └── data/resource.ts    # GraphQL schema
│   └── backend.ts          # Backend configuration
└── amplify_outputs.json    # Auto-generated config
```

## Key Changes for Expo Go

Amplify's default auth uses SRP (requires native modules). We modified it to work in Expo Go:


1. **Changed auth flow** to `USER_PASSWORD_AUTH`:
   ```typescript
   await signIn({
     username: email,
     password,
     options: { authFlowType: "USER_PASSWORD_AUTH" }
   });
   ```

2. **Enabled in Cognito**: AWS Console → Cognito → App clients → Enable `ALLOW_USER_PASSWORD_AUTH`

3. **Custom UI**: Built with React Native components and Expo Router instead of Amplify Authenticator

> **For production**: Use a native build with `USER_SRP_AUTH` for better security.

## View Your Resources

```bash
# User Pool ID
cat amplify_outputs.json | grep user_pool_id

# API Endpoint
cat amplify_outputs.json | grep '"url"'
```

**AWS Console**:
- **Users**: Cognito → User Pools → Your pool → Users tab
- **API**: AppSync → APIs → Your API
- **Storage**: DynamoDB → Tables → Your table

## Documentation

- **Detailed Guide**: See `DEVELOPER_GUIDE.md` for comprehensive documentation


## 📖 Learn More

- [AWS Amplify Docs](https://docs.amplify.aws/react-native/)
- [Amplify Auth](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Expo Documentation](https://docs.expo.dev/)


**Built with Expo and AWS Amplify Gen 2**
***Demo by Matthew Enarle***
