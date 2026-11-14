-- Run once in Supabase SQL Editor.
alter table students add column if not exists full_name text;
alter table students add column if not exists branch text;
alter table students add column if not exists grade text;
alter table students add column if not exists ielts text;
alter table students add column if not exists gre text;

update students set
  full_name = 'Shaik Abdul Khadar',
  branch = 'Electronics and Communication Engineering',
  grade = '2.2 German Grade',
  ielts = '6.0',
  gre = 'V 170, Q 170, AWA 4.5'
where id = 1;
