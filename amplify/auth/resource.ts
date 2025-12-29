import { defineAuth, defineFunction } from '@aws-amplify/backend'; // <--- ADD THIS IMPORT

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './post-confirmation/handler.ts',
});

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      mutable: true,
      required: false,
    },
    familyName: {
      mutable: true,
      required: false,
    },
  },
  groups: ['Admin', 'Customers'],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
  ],
});