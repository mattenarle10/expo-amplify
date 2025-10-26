# 🚀 Expo + AWS Amplify: Auth That Actually Works in Expo Go

> **TL;DR**: Full-stack mobile auth with AWS Amplify Gen 2 that runs in Expo Go—no native build required for development.


> **Read my Blog about it: https://towardsaws.com/weekend-mvp-expo-go-aws-amplify-gen-2-for-startups-b42e3d62fff1**

![AWS Architecture Diagram](./docs/aws-archi.gif)

## What You Get

✅ **Email auth** with OTP verification  
✅ **Session persistence** across app restarts  
✅ **GraphQL API** with real-time sync  
✅ **Auto-created user profiles** via Lambda triggers  
✅ **Works in Expo Go** (the secret: `USER_PASSWORD_AUTH` flow)

**Stack**: React Native · Expo · TypeScript · AWS Cognito · AppSync · DynamoDB




## 🚀 Quick Start

```bash
npm install
npx ampx sandbox --profile <your-aws-profile>  # Terminal 1
npx expo start                                   # Terminal 2
# Scan QR → Open in Expo Go → Done ✨
```

## 📁 Key Files

```
app/(auth)/          # Sign in/up screens
amplify/auth/        # Cognito config + Lambda triggers
amplify/data/        # GraphQL schema
amplify_outputs.json # Auto-generated (gitignored)
```

> **Production tip**: Switch to `USER_SRP_AUTH` with a native build for enhanced security.

## 📖 Resources

- **Deep dive**: See `DEVELOPER_GUIDE.md` for step-by-step setup
- [AWS Amplify Docs](https://docs.amplify.aws/react-native/)
- [Expo Documentation](https://docs.expo.dev/)

---

**Built by Matthew Enarle** · Powered by AWS Amplify Gen 2
