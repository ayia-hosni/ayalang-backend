import { config } from 'dotenv';
import { resolve } from 'path';

// Values already present in process.env (e.g. set by CI) take precedence
// over .env.test, since dotenv never overwrites an existing variable.
config({ path: resolve(__dirname, '../../.env.test') });
process.env.NODE_ENV = 'test';
