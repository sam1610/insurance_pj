import { defineBackend } from '@aws-amplify/backend';
import { auth, postConfirmation } from './auth/resource';
import { data } from './data/resource';
import { predictPremium } from './functions/predict-premium/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  predictPremium
});
const predictLambda = backend.predictPremium.resources.lambda;

predictLambda.addToRolePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      // Allow access to Claude 3 Haiku in your region
      `arn:aws:bedrock:${backend.stack.region}::foundation-model/amazon.titan-text-express-v1`],
  })
);