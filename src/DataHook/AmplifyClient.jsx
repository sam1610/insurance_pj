import { generateClient } from "aws-amplify/api";

// 1. Create the standard Data Client
export const client = generateClient({ authMode: 'userPool' });
