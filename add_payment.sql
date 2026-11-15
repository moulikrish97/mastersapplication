-- Run once in Supabase SQL Editor. Replaces the paid flag with a payment dropdown value.
alter table applications add column if not exists paid boolean not null default false;
alter table applications add column if not exists payment text not null default '-';

update applications set payment = 'Paid' where paid;

alter table applications drop constraint if exists applications_payment_check;
alter table applications add constraint applications_payment_check
  check (payment in ('-','Not paid','Paid','No fee'));

alter table applications drop column if exists paid;
 