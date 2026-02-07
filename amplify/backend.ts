import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { predictPremium } from './functions/predict-premium/resource'; // Import the standard resource
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  predictPremium,
});

// --- PERMISSIONS ---
// Only Bedrock is needed now. S3 is removed.
backend.predictPremium.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-express-v1'],
  })
);