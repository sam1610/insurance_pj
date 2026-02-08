import { defineFunction } from '@aws-amplify/backend';

export const predictPremium = defineFunction({
  name: 'predict-premium',
  entry: './handler.ts',
  // Increase timeout to 30 seconds to give Bedrock time to think
  timeoutSeconds: 30, 
});