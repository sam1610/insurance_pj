import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  InsuranceData: a.model({
      // 1. COMPOSITE PRIMARY KEY
      pk: a.string().required(), // Partition Key (e.g., USER#123)
      sk: a.string().required(), // Sort Key (e.g., POL#456)

      // 2. DISCRIMINATOR
      // Helps frontend know if this row is a Policy, Claim, or Profile
      type: a.enum(['PROFILE', 'POLICY', 'CLAIM']),

      // 3. GSI ATTRIBUTES (Overloading)
      // Used for different access patterns like "Find by Status"
      // gsi1pk: a.string(),
      // gsi1sk: a.string(),

      // 4. COMMON ATTRIBUTES (Sparse)
      // Profile Attributes
      firstName: a.string(),
      lastName: a.string(),
      email: a.string(),
      phoneNbr:a.string(),
      address:a.string(),

      // Policy Attributes
      policyNumber: a.string(),
      coverageAmount: a.float(),
      premiumAmount: a.float(),
      startDate: a.string(), // ISO Date string recommended for sorting
      endDate: a.string(),

      // Claim Attributes
      claimDescription: a.string(),
      incidentDate: a.string(),
      
      // Shared Attributes
      status: a.string(), // Used by both Policy and Claim
      createdAt: a.datetime(),
    })
    // 5. KEY CONFIGURATION
    .identifier(['pk', 'sk']) // <--- This forces the Composite Key
    .authorization(allow => [allow.owner()])
    .secondaryIndexes((index) => [
      // GSI 1: Generic Overloaded Index
      // Pattern A: "Get all Claims by Status" -> gsi1pk="CLAIM#OPEN", gsi1sk="2024-01-01"
      // Pattern B: "Get Policies by Type" -> gsi1pk="TYPE#AUTO", gsi1sk="2024-01-01"
      index('type').sortKeys(['pk']).name('user').queryField("userList"),
      index('type').sortKeys(['sk']).name('policy').queryField("policyList"),
      index('type').sortKeys(['status']).name('status').queryField("ativePolicy"),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});