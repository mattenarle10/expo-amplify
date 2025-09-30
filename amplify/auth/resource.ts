import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Enable USER_PASSWORD_AUTH for Expo Go compatibility (SRP requires native modules)
  userAttributes: {
    email: {
      required: true,
    },
  },
});
