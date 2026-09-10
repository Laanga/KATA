import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const config = process.env.KATA_LOCAL_CONFIG
  ? JSON.parse(fs.readFileSync(process.env.KATA_LOCAL_CONFIG, 'utf8'))
  : JSON.parse(fs.readFileSync('/tmp/kata-local-supabase.json', 'utf8'));
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(config.API_URL))
  throw new Error('Integration tests require disposable local Supabase');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, options);
const ids = [];
const clients = [];
try {
  for (const label of ['a', 'b']) {
    const email = `integration-${label}-${Date.now()}@example.test`;
    const password = 'Local-integration-only-2026!';
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: `Test${label}` },
    });
    assert.equal(error, null);
    ids.push(data.user.id);
    const client = createClient(config.API_URL, config.PUBLISHABLE_KEY || config.ANON_KEY, options);
    assert.equal((await client.auth.signInWithPassword({ email, password })).error, null);
    clients.push(client);
  }
  const [a, b] = clients;
  assert.equal(
    (await a.from('user_preferences').select('*')).data.length,
    0,
    'New account has no pre-completed onboarding',
  );
  assert.equal((await a.from('user_preferences').insert({ user_id: ids[0] })).error, null);
  assert.equal(
    (await a.from('user_preferences').select('*').single()).data.onboarding_status,
    'pending',
  );
  assert.equal(
    (
      await a
        .from('user_preferences')
        .update({ onboarding_status: 'skipped' })
        .eq('user_id', ids[0])
    ).error,
    null,
  );
  assert.equal(
    (
      await a
        .from('user_preferences')
        .update({ onboarding_status: 'in_progress', onboarding_step: 2, preferred_type: 'BOOK' })
        .eq('user_id', ids[0])
    ).error,
    null,
  );
  assert.equal((await a.from('user_preferences').select('*').single()).data.onboarding_step, 2);
  assert.equal(
    (await b.from('user_preferences').select('*')).data.length,
    0,
    'Private preferences',
  );
  assert.ok(
    (await b.from('user_preferences').insert({ user_id: ids[0] })).error,
    'Cannot write another account',
  );
  const payload = {
    version: 1,
    items: [
      {
        id: 'first',
        title: 'Integration book',
        type: 'BOOK',
        status: 'COMPLETED',
        rating: 0,
        provider: 'openlibrary',
        externalId: 'integration',
        review: 'Keep me',
        createdAt: '2020-01-02T00:00:00Z',
        updatedAt: '2020-02-03T00:00:00Z',
        completedAt: '2020-01-25T00:00:00Z',
      },
    ],
    collections: [
      {
        id: 'col',
        name: 'QA',
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2020-02-01T00:00:00Z',
      },
    ],
    relationships: [{ itemId: 'first', collectionId: 'col' }],
  };
  assert.equal((await a.rpc('import_library', { payload })).error, null);
  const rows = await a.from('media_items').select('*');
  assert.equal(rows.data.length, 1);
  const item = rows.data[0];
  assert.equal(item.rating, 0);
  assert.equal(Date.parse(item.created_at), Date.parse(payload.items[0].createdAt));
  assert.equal(Date.parse(item.updated_at), Date.parse(payload.items[0].updatedAt));
  assert.equal(Date.parse(item.completed_at), Date.parse(payload.items[0].completedAt));
  const restoredCollection = (await a.from('collections').select('*').single()).data;
  assert.equal(
    Date.parse(restoredCollection.created_at),
    Date.parse(payload.collections[0].createdAt),
  );
  assert.equal(
    Date.parse(restoredCollection.updated_at),
    Date.parse(payload.collections[0].updatedAt),
  );
  assert.equal((await b.from('media_items').select('*')).data.length, 0);
  assert.equal((await a.from('media_items_collections').select('*')).data.length, 1);
  assert.ok(
    (
      await a.rpc('import_library', {
        payload: { items: [{ title: 'invalid', type: 'MOVIE', status: 'READING' }] },
        replace_existing: true,
      })
    ).error,
  );
  assert.equal(
    (await a.from('media_items').select('*').single()).data.review,
    'Keep me',
    'Failed replace rolled back',
  );
  assert.equal(
    (await a.from('media_items').update({ review: null }).eq('id', item.id)).error,
    null,
  );
  assert.equal((await a.from('media_items').select('*').single()).data.review, null);
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1cAAAAASUVORK5CYII=',
    'base64',
  );
  const path = `${ids[0]}/test.png`;
  assert.equal(
    (await a.storage.from('avatars').upload(path, png, { contentType: 'image/png' })).error,
    null,
  );
  assert.ok(
    (
      await b.storage
        .from('avatars')
        .upload(`${ids[0]}/intruder.png`, png, { contentType: 'image/png' })
    ).error,
    'Avatar path isolation',
  );
  await b.storage.from('avatars').remove([path]);
  assert.equal(
    (await a.storage.from('avatars').download(path)).error,
    null,
    'Other user cannot remove avatar',
  );
  assert.equal((await a.storage.from('avatars').remove([path])).error, null);
  assert.equal((await a.rpc('clear_library')).error, null);
  assert.equal((await a.from('media_items').select('*')).data.length, 0);
  const anon = createClient(config.API_URL, config.PUBLISHABLE_KEY || config.ANON_KEY, options);
  for (const [name, args] of [
    ['clear_library', {}],
    ['import_library', { payload }],
    ['consume_api_request', {}],
  ])
    assert.ok((await anon.rpc(name, args)).error, `${name} rejects anonymous access`);
  console.log(
    'PASS: local Supabase Auth, onboarding skip/resume, RLS, atomic import, notes, zero rating, avatars and anonymous RPC denial',
  );
} finally {
  for (const id of ids) {
    const listing = await admin.storage.from('avatars').list(id);
    if (listing.data?.length)
      await admin.storage.from('avatars').remove(listing.data.map((file) => `${id}/${file.name}`));
    await admin.auth.admin.deleteUser(id);
  }
}
