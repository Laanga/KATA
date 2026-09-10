-- Public avatars contain profile images only. Writes are confined to each account.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy "kata_avatar_insert" on storage.objects for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "kata_avatar_select_own" on storage.objects for select to authenticated
using (bucket_id='avatars' and ((storage.foldername(name))[1]=(select auth.uid())::text or name like 'avatars/'||(select auth.uid())::text||'-%'));
create policy "kata_avatar_delete_own" on storage.objects for delete to authenticated
using (bucket_id='avatars' and ((storage.foldername(name))[1]=(select auth.uid())::text or name like 'avatars/'||(select auth.uid())::text||'-%'));
