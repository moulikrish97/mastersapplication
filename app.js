const STATUSES = ['Not started', 'In progress', 'Submitted', 'Interview', 'Accepted', 'Rejected'];
const CLOSED = ['Submitted', 'Interview', 'Accepted', 'Rejected'];
const PORTALS = ['Uniassist', 'Own Portal', 'Own Portal with VPD'];
const YES_NO = ['No', 'Yes'];
const ICON_EDIT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
const ALL = 'all';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let students = [];
let applications = [];
let selected = ALL;
let editingId = null;

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

    const edit = el('button', undefined, { type: 'button', className: 'icon', title: 'Edit' });
    edit.innerHTML = ICON_EDIT;
    edit.onclick = () => openDialog(a);

    const del = el('button', undefined, { type: 'button', className: 'icon danger', title: 'Delete' });
    del.innerHTML = ICON_DELETE;
    del.onclick = async () => {
      if (!confirm('Delete this application?')) return;
      await run(db.from('applications').delete().eq('id', a.id));
      await loadData();
    };

    const statusCell = el('td');
    statusCell.append(statusSel);
    const delCell = el('td', undefined, { className: 'row-actions' });
    delCell.append(edit, del);

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

function renderProfile() {
  const s = students.find((x) => x.id === selected);
  const box = $('profile');
  box.replaceChildren();
  if (!s) return;
  [['Full name', s.full_name], ['Branch', s.branch], ['Grade', s.grade], ['IELTS', s.ielts], ['GRE', s.gre]].forEach(([k, v]) => {
    const item = el('div', undefined, { className: 'pitem' });
    item.append(el('span', k, { className: 'plabel' }), el('span', v || '-'));
    box.append(item);
  });
}

function render() {
  const apps = selected === ALL ? applications : applications.filter((a) => a.student_id === selected);
  renderTabs();
  renderSummary(apps);
  renderRows(apps);
  $('studentBar').hidden = selected === ALL;
  renderProfile();
}

$('editProfileBtn').onclick = () => {
  const s = students.find((x) => x.id === selected);
  $('pName').value = s.name;
  $('pFullName').value = s.full_name ?? '';
  $('pBranch').value = s.branch ?? '';
  $('pGrade').value = s.grade ?? '';
  $('pIelts').value = s.ielts ?? '';
  $('pGre').value = s.gre ?? '';
  $('profileDialog').showModal();
};
$('cancelProfileBtn').onclick = () => $('profileDialog').close();

$('profileForm').onsubmit = async (e) => {
  e.preventDefault();
  const val = (id) => $(id).value.trim() || null;
  await run(db.from('students').update({
    name: $('pName').value.trim(),
    full_name: val('pFullName'),
    branch: val('pBranch'),
    grade: val('pGrade'),
    ielts: val('pIelts'),
    gre: val('pGre'),
  }).eq('id', selected));
  $('profileDialog').close();
  await loadData();
};

STATUSES.forEach((s) => $('status').append(el('option', s, { value: s })));
$('portal').append(el('option', '-', { value: '' }));
PORTALS.forEach((p) => $('portal').append(el('option', p, { value: p })));
YES_NO.forEach((v) => $('gre').append(el('option', v, { value: v })));

function openDialog(app) {
  editingId = app?.id ?? null;
  $('dialogTitle').textContent = app ? 'Edit application' : 'Add application';
  $('university').value = app?.university ?? '';
  $('program').value = app?.program ?? '';
  $('deadline').value = app?.deadline ?? '';
  $('ielts').value = app?.ielts ?? '';
  $('gre').value = app?.gre ?? 'No';
  $('portal').value = app?.portal ?? '';
  $('status').value = app?.status ?? 'Not started';
  $('link').value = app?.link ?? '';
  $('notes').value = app?.notes ?? '';
  $('appDialog').showModal();
}

$('addBtn').onclick = () => openDialog(null);
$('cancelBtn').onclick = () => $('appDialog').close();

$('appForm').onsubmit = async (e) => {
  e.preventDefault();
  const fields = {
    university: $('university').value.trim(),
    program: $('program').value.trim(),
    deadline: $('deadline').value || null,
    ielts: $('ielts').value.trim() || null,
    gre: $('gre').value,
    portal: $('portal').value || null,
    status: $('status').value,
    link: $('link').value.trim() || null,
    notes: $('notes').value.trim() || null,
  };
  await run(editingId
    ? db.from('applications').update(fields).eq('id', editingId)
    : db.from('applications').insert({ ...fields, student_id: selected }));
  $('appDialog').close();
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
