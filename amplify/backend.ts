import { defineBackend } from '@aws-amplify/backend';
import { auth , postConfirmation} from './auth/resource';
import { data } from './data/resource';

defineBackend({
  auth,
  data,
  postConfirmation
});