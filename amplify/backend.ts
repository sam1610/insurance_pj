import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { predictPremium } from './functions/predict-premium/resource'; // Your function
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  predictPremium, // <--- Ensure this is included here
});

// --- 🔥 CRITICAL FIX: GRANT PERMISSION TO BEDROCK 🔥 ---
// This tells AWS: "Let the predictPremium function use the Titan Model"
backend.predictPremium.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    // Allow access to ALL models in the region to avoid ARN typo issues
    resources: ['arn:aws:bedrock:*:*:foundation-model/*'], 
  })
);