import { defineFunction } from '@aws-amplify/backend';

export const predictCustomerResponse = defineFunction({
  name: 'predict-customer-response',
  entry: './handler.py',
  runtime: 3.11, // Python 3.11
  timeoutSeconds: 30,
  environment: {
    MODEL_BUCKET: 'datastream-aai-bh', // Replace with your actual bucket
    MODEL_KEY: 'premiumModel.pkl'
  }
});