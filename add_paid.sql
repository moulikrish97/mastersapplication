-- Run once in Supabase SQL Editor. Adds the payment flag; the old link column is left in place.
alter table applications add column if not exists paid boolean not null default false;
