-- Run once in Supabase SQL Editor. Allows the new 'VPD applied' status.
alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check
  check (status in ('Not started','In progress','VPD applied','Submitted','Interview','Accepted','Rejected'));
