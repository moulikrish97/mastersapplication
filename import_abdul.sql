-- Run in Supabase SQL Editor after schema.sql. Safe to run on a database created from either version of schema.sql.
alter table applications alter column deadline drop not null;
alter table applications add column if not exists deadline_note text;
alter table applications add column if not exists requirements text;
alter table applications add column if not exists portal text;

update students set name = 'Abdul' where id = 1;

insert into applications (student_id, university, program, deadline, deadline_note, requirements, portal, status, notes) values
(1, 'University of Paderborn', 'Masters in Computer Engineering', '2026-11-15', '1 April to 15 Nov', '6 and GRE', 'uniassist', 'Accepted', null),
(1, 'University of Kassel', 'Masters in Electrical Engineering', '2027-01-15', '1 Sept to 15 Jan', '6 and German needed', 'uniassist', 'Submitted', null),
(1, 'RPTU Kaiserslautern', 'Automation and Control', '2026-10-31', '1 May to 31 Oct', '6 and GRE', 'own portal', 'Submitted', null),
(1, 'University of Kassel', 'Masters in Electrical and Communication Engineering', '2027-01-15', '1 Sept to 15 Jan', '6', 'uniassist', 'Submitted', null),
(1, 'HS Wismar', 'Masters in Information and Electrical Engineering', '2027-01-15', '1 Sept to 15 Jan', '6', 'mail', 'Accepted', null),
(1, 'HKA (Karlsruhe)', 'Sensor System Technology', '2026-11-15', '15 Nov', '5.5 and GRE', 'own portal', 'Submitted', null),
(1, 'FH Westkueste', 'Masters in Micro Electronic Systems', '2027-01-15', 'Nov 15 to Jan 15', '5.5 or MOI', 'own portal', 'Not started', null),
(1, 'HAW Kiel', 'Masters in Battery Technologies', '2027-01-15', 'Nov to Jan 15', '6 and GRE', 'uniassist', 'Submitted', null),
(1, 'HS Kempten', 'Masters in Electrical Engineering', '2027-01-15', 'Nov 15 to Jan 15', '5.5 or MOI', 'own portal', 'Not started', null),
(1, 'Frankfurt University of Applied Sciences', 'Masters in Electrical Engineering Renewable Energy', '2026-10-15', 'Oct 15', '6', 'uniassist', 'Not started', null),
(1, 'TH OWL', 'Masters in Electrical Engineering', '2027-01-15', 'Nov 17 to Jan 15', '6', 'uniassist', 'Not started', 'Mail needed'),
(1, 'OTH Regensburg', 'Masters in Electrical and Microelectronics', null, null, null, null, 'Not started', null),
(1, 'TH Augsburg', 'Masters in Electrical Engineering', '2026-12-15', 'Nov 15 to Dec 15', '6.5', null, 'Not started', 'VPD needed');
