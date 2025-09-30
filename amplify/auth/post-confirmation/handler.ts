import type { PostConfirmationTriggerHandler } from 'aws-lambda';

/**
 * Post-confirmation trigger
 * This Lambda is triggered after a user confirms their email
 * We'll create the user profile in the app after sign-in instead
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    // Extract user attributes from Cognito event
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const username = event.request.userAttributes.preferred_username || email?.split('@')[0] || 'user';

    console.log(`[PostConfirmation] User confirmed - userId: ${userId}, username: ${username}, email: ${email}`);
    
    // User profile will be created in the app after first sign-in
    // This keeps the Lambda simple and avoids complex SDK configurations
    
  } catch (error) {
    console.error('[PostConfirmation] Error:', error);
    // Don't throw - we don't want to block user sign-up
  }

  return event;
};
