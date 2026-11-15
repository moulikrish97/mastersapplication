-- Run once in Supabase SQL Editor. Adds Likhith as a new student with all 21 applications.
insert into students (id, name)
select coalesce(max(id), 0) + 1, 'Likhith' from students;

with target as (select id as student_id from students where name = 'Likhith'),
base as (select coalesce(max(position), -1) as m from applications where student_id = (select student_id from target))
insert into applications (student_id, university, program, deadline, ielts, gre, portal, status, notes, position)
select t.student_id, v.university, v.program, v.deadline::date, v.ielts, v.gre, v.portal, v.status, v.notes, base.m + v.n
from target t, base, (values
  (1,  'TU Ilmenau',                         'Masters in Computer and Systems Engineering',        null,         '7 (6.5 is fine)',          'No',  'Uniassist',           'Submitted',   null),
  (2,  'University of Paderborn',            'Masters in Computer Science',                        null,         '6.5 or MOI',               'No',  'Uniassist',           'Submitted',   'AI specialization; GRE if grade < 1.8'),
  (3,  'University of Augsburg',             'Masters in Data Science',                            null,         null,                       'No',  'Own Portal',          'Submitted',   null),
  (4,  'University of Augsburg',             'Masters in Mathematics and Data Science',            null,         null,                       'No',  'Own Portal',          'Submitted',   null),
  (5,  'University of Hildesheim',           'Masters in Data Analytics',                          null,         null,                       'No',  'Own Portal',          'Submitted',   null),
  (6,  'Albstadt-Sigmaringen University',    'Masters in Industrial Artificial Intelligence',      null,         '6',                        'No',  'Own Portal with VPD', 'VPD applied', 'VPD applied (Konstanz)'),
  (7,  'Leibniz University Hannover',        'Masters in Computer Science',                        null,         '6 (7.0 for enrollment)',   'No',  'Own Portal with VPD', 'Submitted',   null),
  (8,  'Bauhaus-Universität Weimar',         'Masters in Computer Science for Digital Media',      '2027-01-15', '6.5',                      'No',  'Uniassist',           'Submitted',   'Data science specialization'),
  (9,  'Hochschule Hof',                     'Masters in AI and Robotics',                         '2026-11-30', '6.5',                      'No',  'Own Portal with VPD', 'VPD applied', 'VPD applied (Uniassist)'),
  (10, 'University of Trier',                'Masters in Data Science',                            '2026-12-15', '6.5',                      'No',  'Own Portal',          'Not started', null),
  (11, 'University of Passau',               'Masters in Computer Science',                        '2026-12-15', '6.0',                      'No',  'Uniassist',           'Not started', null),
  (12, 'University of Passau',               'Masters in AI',                                      '2026-12-15', '6.0',                      'No',  'Uniassist',           'Submitted',   null),
  (13, 'TU Dresden',                         'Masters in Data Science',                            null,         null,                       'Yes', null,                  'Not started', null),
  (14, 'TU Berlin',                          'Masters in Computer Science',                        null,         '6.5',                      'No',  'Own Portal with VPD', 'Not started', null),
  (15, 'University of Hildesheim',           'Masters in Data Analytics',                          '2026-12-15', '6.0',                      'No',  'Own Portal',          'Not started', null),
  (16, 'BTU Cottbus-Senftenberg',            'Masters in AI',                                      '2027-01-15', '6.5',                      'No',  'Uniassist',           'Not started', null),
  (17, 'TU Ilmenau',                         'Masters in Data Science',                            null,         '7 (6.5 is fine)',          'No',  'Uniassist',           'Not started', null),
  (18, 'Hochschule Aalen',                   'Masters in ML and Data Analytics',                   '2026-12-15', '6.5',                      'No',  'Own Portal',          'Not started', null),
  (19, 'Hochschule Hof',                     'Masters in Artificial Intelligence and Robotics',    '2026-11-30', '6.5',                      'No',  'Uniassist',           'Not started', 'May ask A1'),
  (20, 'TH Ulm',                             'Masters in Intelligent Systems',                     '2026-11-15', '6',                        'No',  'Own Portal with VPD', 'Not started', 'AI track'),
  (21, 'University of Kassel',               'Masters in Computer Science',                        null,         '5.5 or MOI',               'Yes', 'Uniassist',           'Not started', null)
) as v(n, university, program, deadline, ielts, gre, portal, status, notes);
