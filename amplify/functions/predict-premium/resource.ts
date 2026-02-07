import { defineFunction } from '@aws-amplify/backend';

export const predictPremium = defineFunction({
  name: 'predict-premium',
  resourceGroupName: 'data', // 👈 ADD THIS LINE (Moves function to Data Stack)
  entry: './handler.ts'
});