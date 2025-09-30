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
***Demo by Matthew Enarle***
