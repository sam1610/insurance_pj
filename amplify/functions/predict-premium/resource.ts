import { defineFunction } from '@aws-amplify/backend';

export const predictPremium = defineFunction({
  name: 'predict-premium',
  entry: './handler.ts',
  timeoutSeconds: 30, // Give Bedrock time to think
});