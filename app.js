const STATUSES = ['Not started', 'In progress', 'Submitted', 'Interview', 'Accepted', 'Rejected'];
const CLOSED = ['Submitted', 'Interview', 'Accepted', 'Rejected'];
const PORTALS = ['Uniassist', 'Own Portal', 'Own Portal with VPD'];
const ALL = 'all';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let students = [];
let applications = [];
let selected = ALL;

const $ = (id) => document.getElementById(id);
const studentName = (id) => students.find((s) => s.id === id)?.name ?? '';

function el(tag, text, attrs = {}) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  Object.assign(e, attrs);
  return e;
}

function safeUrl(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

async function run(query) {
  const { data, error } = await query;
  if (error) {
    alert(error.message);
    throw error;
  }
  return data;
}

async function loadData() {
  students = await run(db.from('students').select('*').order('id'));
  applications = await run(db.from('applications').select('*'));
  render();
}

function showApp(signedIn) {
  $('loginView').hidden = signedIn;
  $('appView').hidden = !signedIn;
  $('tabs').hidden = !signedIn;
  $('logoutBtn').hidden = !signedIn;
}

function renderTabs() {
  const tabs = $('tabs');
  tabs.replaceChildren();
  const make = (label, value) => {
    const b = el('button', label, { type: 'button' });
    if (selected === value) b.classList.add('active');
    b.onclick = () => { selected = value; render(); };
    tabs.append(b);
  };
  make('All students', ALL);
  students.forEach((s) => make(s.name, s.id));
}

function renderSummary(apps) {
  const box = $('summary');
  box.replaceChildren(el('div', `Total: ${apps.length}`, { className: 'chip' }));
  STATUSES.forEach((st) => {
    const n = apps.filter((a) => a.status === st).length;
    if (n) box.append(el('div', `${st}: ${n}`, { className: 'chip' }));
  });
}

function renderRows(apps) {
  const body = $('rows');
  body.replaceChildren();
  const today = new Date().toISOString().slice(0, 10);

  [...apps].sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')).forEach((a) => {
    const tr = el('tr');
    if (a.deadline && a.deadline < today && !CLOSED.includes(a.status)) tr.classList.add('overdue');

    const statusSel = el('select');
    STATUSES.forEach((s) => statusSel.append(el('option', s, { value: s, selected: s === a.status })));
    statusSel.onchange = async () => {
      await run(db.from('applications').update({ status: statusSel.value }).eq('id', a.id));
      await loadData();
    };

    const linkCell = el('td');
    const href = a.link && safeUrl(a.link);
    if (href) linkCell.append(el('a', 'Open', { href, target: '_blank', rel: 'noopener noreferrer' }));

    const del = el('button', 'Delete', { type: 'button', className: 'danger' });
    del.onclick = async () => {
      if (!confirm('Delete this application?')) return;
      await run(db.from('applications').delete().eq('id', a.id));
      await loadData();
    };

    const statusCell = el('td');
    statusCell.append(statusSel);
    const delCell = el('td');
    delCell.append(del);

    tr.append(
      el('td', studentName(a.student_id)),
      el('td', a.university),
      el('td', a.program),
      el('td', a.deadline ?? ''),
      el('td', a.ielts ?? ''),
      el('td', a.gre ?? ''),
      el('td', a.portal ?? ''),
      statusCell,
      linkCell,
      el('td', a.notes ?? ''),
      delCell,
    );
    body.append(tr);
  });

  $('empty').hidden = apps.length > 0;
}

function render() {
  const apps = selected === ALL ? applications : applications.filter((a) => a.student_id === selected);
  renderTabs();
  renderSummary(apps);
  renderRows(apps);
  $('studentBar').hidden = selected === ALL;
  $('appForm').hidden = selected === ALL;
  if (selected !== ALL) $('studentName').value = studentName(selected);
}

$('studentName').onchange = async (e) => {
  const name = e.target.value.trim();
  if (name) await run(db.from('students').update({ name }).eq('id', selected));
  await loadData();
};

STATUSES.forEach((s) => $('status').append(el('option', s, { value: s })));
$('portal').append(el('option', 'Portal', { value: '' }));
PORTALS.forEach((p) => $('portal').append(el('option', p, { value: p })));

$('appForm').onsubmit = async (e) => {
  e.preventDefault();
  await run(db.from('applications').insert({
    student_id: selected,
    university: $('university').value.trim(),
    program: $('program').value.trim(),
    deadline: $('deadline').value || null,
    ielts: $('ielts').value.trim() || null,
    gre: $('gre').value.trim() || null,
    portal: $('portal').value || null,
    status: $('status').value,
    link: $('link').value.trim() || null,
    notes: $('notes').value.trim() || null,
  }));
  e.target.reset();
  await loadData();
};

$('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  $('loginError').textContent = '';
  const { error } = await db.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value,
  });
  if (error) $('loginError').textContent = error.message;
};

$('logoutBtn').onclick = () => db.auth.signOut();

db.auth.onAuthStateChange((_event, session) => {
  showApp(!!session);
  if (session) loadData();
  else { students = []; applications = []; }
});
