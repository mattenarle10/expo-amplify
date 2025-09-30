import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: '', // Will be set by backend
  },
});
