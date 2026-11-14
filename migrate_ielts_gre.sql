-- Run once in Supabase SQL Editor on a database that already ran import_abdul.sql.
alter table applications add column if not exists ielts text;
alter table applications add column if not exists gre text;

update applications set
  ielts = substring(requirements from '^[0-9]+(\.[0-9]+)?( or MOI)?'),
  gre = case when requirements ilike '%gre%' then 'Required' end,
  notes = case
    when lower(portal) = 'mail' then concat_ws('; ', notes, 'Apply by mail')
    when requirements ilike '%german%' then concat_ws('; ', notes, 'German needed')
    else notes
  end,
  portal = case
    when lower(portal) = 'uniassist' then 'Uniassist'
    when lower(portal) = 'own portal' then 'Own Portal'
    when notes ilike '%vpd%' then 'Own Portal with VPD'
  end;

alter table applications drop column deadline_note;
alter table applications drop column requirements;

alter table applications drop constraint if exists applications_portal_check;
alter table applications add constraint applications_portal_check
  check (portal in ('Uniassist','Own Portal','Own Portal with VPD'));
