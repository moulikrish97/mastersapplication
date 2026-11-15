-- Run once in Supabase SQL Editor. Removes the unused placeholder students 3 to 6 (and any applications under them).
delete from students
where id in (3, 4, 5, 6) and name like 'Student %';
