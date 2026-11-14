-- Run once in Supabase Dashboard > SQL Editor.
create table students (
  id int primary key,
  name text not null
);

insert into students (id, name)
select n, 'Student ' || n from generate_series(1, 6) n;

create table applications (
  id uuid primary key default gen_random_uuid(),
  student_id int not null references students(id) on delete cascade,
  university text not null,
  program text not null,
  deadline date,
  ielts text,
  gre text not null default 'No' check (gre in ('Yes','No')),
  portal text check (portal in ('Uniassist','Own Portal','Own Portal with VPD')),
  status text not null default 'Not started'
    check (status in ('Not started','In progress','Submitted','Interview','Accepted','Rejected')),
  link text,
  notes text,
  created_at timestamptz not null default now()
);

alter table students enable row level security;
alter table applications enable row level security;

create policy "authenticated full access" on students
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on applications
  for all to authenticated using (true) with check (true);
