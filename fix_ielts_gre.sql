-- Run once in Supabase SQL Editor. Repairs IELTS values truncated by the earlier migration and makes GRE a Yes/No field.
update applications a set ielts = v.ielts
from (values
  ('University of Paderborn', 'Masters in Computer Engineering', '6'),
  ('University of Kassel', 'Masters in Electrical Engineering', '6'),
  ('RPTU Kaiserslautern', 'Automation and Control', '6'),
  ('University of Kassel', 'Masters in Electrical and Communication Engineering', '6'),
  ('HS Wismar', 'Masters in Information and Electrical Engineering', '6'),
  ('HKA (Karlsruhe)', 'Sensor System Technology', '5.5'),
  ('FH Westkueste', 'Masters in Micro Electronic Systems', '5.5 or MOI'),
  ('HAW Kiel', 'Masters in Battery Technologies', '6'),
  ('HS Kempten', 'Masters in Electrical Engineering', '5.5 or MOI'),
  ('Frankfurt University of Applied Sciences', 'Masters in Electrical Engineering Renewable Energy', '6'),
  ('TH OWL', 'Masters in Electrical Engineering', '6'),
  ('TH Augsburg', 'Masters in Electrical Engineering', '6.5')
) as v(university, program, ielts)
where a.university = v.university and a.program = v.program;

update applications set gre = case when gre = 'Required' then 'Yes' else 'No' end;

alter table applications alter column gre set default 'No';
alter table applications alter column gre set not null;
alter table applications drop constraint if exists applications_gre_check;
alter table applications add constraint applications_gre_check check (gre in ('Yes','No'));
