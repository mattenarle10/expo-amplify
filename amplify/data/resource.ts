import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.id().required(),
      email: a.email().required(),
      username: a.string().required(),
      avatarUrl: a.url(),
      bio: a.string(),
      createdAt: a.datetime(),
      lastLoginAt: a.datetime(),
    })
    .authorization((allow) => [
      // Allow authenticated users to create and read their own profile
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ])
    .identifier(['userId']),
});

export type Schema = ClientSchema<typeof schema>;

// Create the data resource
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

