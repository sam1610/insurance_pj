import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    await client.send(new AdminAddUserToGroupCommand({
      GroupName: 'Customers',
      UserPoolId: event.userPoolId,
      Username: event.userName,
    }));
    console.log(`User ${event.userName} added to Customers group.`);
  } catch (err) {
    console.error('Error adding user to Customers group:', err);
  }

  return event;
};