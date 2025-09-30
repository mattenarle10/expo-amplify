import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

// Create and export data client
export const dataClient = generateClient<Schema>();
