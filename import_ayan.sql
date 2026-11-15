-- Run once in Supabase SQL Editor. Adds Ayan as student 2 with his profile and all 14 applications.
update students set
  name = 'Ayan',
  full_name = 'Ayyan Sohail Mohammad',
  branch = 'CSE',
  grade = '1.9 German Grade',
  ielts = '6.0',
  gre = 'V 169, Q 170, AWA 4.0'
where id = 2;

with target as (select 2 as student_id),
base as (select coalesce(max(position), -1) as m from applications where student_id = (select student_id from target))
insert into applications (student_id, university, program, deadline, ielts, gre, portal, status, notes, position)
select t.student_id, v.university, v.program, v.deadline::date, v.ielts, v.gre, v.portal, v.status, v.notes, base.m + v.n
from target t, base, (values
  (1,  'University of Hildesheim',       'Masters in Software Engineering',                          null,         null,                    'No',  null,                  'Submitted',   null),
  (2,  'Hochschule Emden/Leer',          'Masters in Industrial Informatics',                        null,         null,                    'No',  null,                  'Submitted',   null),
  (3,  'University of Kassel',           'Masters in Computer Science',                              null,         '5.5 or MOI',            'Yes', 'Uniassist',           'Submitted',   null),
  (4,  'RPTU Kaiserslautern',            'Masters in Computer Science',                              null,         '6.0',                   'Yes', 'Own Portal',          'Not started', null),
  (5,  'University of Konstanz',         'Masters in Computer and Information Science',              null,         null,                    'No',  null,                  'Not started', 'Summer intake may not be possible'),
  (6,  'University of Paderborn',        'Masters in Computer Science',                              null,         '6.5 or MOI',            'Yes', 'Uniassist',           'Submitted',   null),
  (7,  'TU Ilmenau',                     'Research Computer and Systems Engineering',                null,         '6.0 for conditional',   'No',  'Uniassist',           'Not started', 'IELTS 7 required for enrollment'),
  (8,  'TH OWL',                         'Masters in IT',                                            '2027-01-15', '5.5',                   'No',  'Uniassist',           'Not started', 'Min grade 2.5'),
  (9,  'HAW Kiel',                       'Masters in Computer Science',                              '2027-01-15', '6.0 or 5.5',            'Yes', 'Uniassist',           'Not started', 'Min grade 2.5'),
  (10, 'Hochschule Rhein-Waal',          'Masters in Information Engineering and Computer Science',  '2027-01-15', '5.5',                   'Yes', 'Uniassist',           'Not started', 'Min grade 2.3'),
  (11, 'University of Regensburg',       'Masters in Data Science',                                  '2026-12-01', '6.5 or MOI',            'Yes', 'Own Portal with VPD', 'Not started', null),
  (12, 'TU Dresden',                     'Masters in Computer Science',                              null,         null,                    'Yes', null,                  'Not started', null),
  (13, 'University of Bamberg',          'Masters in International Software Systems Science',        null,         null,                    'Yes', null,                  'Not started', 'Min grade 2.0'),
  (14, 'FH Aachen',                      'Masters in Information Systems',                           null,         null,                    'Yes', null,                  'Not started', 'GRE mandatory 50%')
) as v(n, university, program, deadline, ielts, gre, portal, status, notes);
