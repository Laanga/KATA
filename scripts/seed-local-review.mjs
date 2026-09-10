import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const config = JSON.parse(fs.readFileSync('/tmp/kata-local-supabase.json', 'utf8'));
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(config.API_URL))
  throw new Error('This fixture only runs against local Supabase');
const client = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
for (const [email, username] of [
  ['kata-qa-new@example.test', 'KataQA'],
  ['kata-qa-incomplete@example.test', null],
]) {
  const { error } = await client.auth.admin.createUser({
    email,
    password: 'Kata-test-only-2026!',
    email_confirm: true,
    user_metadata: username ? { username } : {},
  });
  if (error && !error.message.includes('already')) throw error;
  console.log(`Local test account ready: ${email}`);
}
