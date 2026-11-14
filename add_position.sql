-- Run once in Supabase SQL Editor. Stores the manual row order used by drag-and-drop.
alter table applications add column if not exists position int;

update applications a set position = r.rn
from (
  select id, row_number() over (partition by student_id order by deadline nulls last, created_at) - 1 as rn
  from applications
) r
where a.id = r.id;
