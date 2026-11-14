const STATUSES = ['Not started', 'In progress', 'VPD applied', 'Submitted', 'Interview', 'Accepted', 'Rejected'];
const CLOSED = ['Submitted', 'Interview', 'Accepted', 'Rejected'];
const PORTALS = ['Uniassist', 'Own Portal', 'Own Portal with VPD'];
const YES_NO = ['No', 'Yes'];
const PAYMENT = ['-', 'Not paid', 'Paid', 'No fee'];
const PAY_CLASS = { '-': 'pay-none', 'Not paid': 'pay-unpaid', Paid: 'pay-paid', 'No fee': 'pay-nofee' };
const ALL = 'all';
const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const ICON_EDIT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ICON_GRIP = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

const byOrder = (apps) => [...apps].sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9)
  || (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'));

async function reorder(fromId, toId) {
  const list = byOrder(applications.filter((a) => a.student_id === selected));
  const from = list.findIndex((a) => a.id === fromId);
  const to = list.findIndex((a) => a.id === toId);
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);

  const changed = [];
  list.forEach((a, i) => {
    if (a.position !== i) {
      a.position = i;
      changed.push(a);
    }
  });
  render();
  await Promise.all(changed.map((a) => run(db.from('applications').update({ position: a.position }).eq('id', a.id))));
}

let students = [];
let applications = [];
let selected = ALL;
let editingId = null;
let dragId = null;

const $ = (id) => document.getElementById(id);
const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
const findStudent = (id) => students.find((s) => s.id === id);

function el(tag, text, attrs = {}) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  Object.assign(e, attrs);
  return e;
}

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const daysUntil = (d) => Math.round((new Date(`${d}T00:00:00`) - new Date(new Date().toDateString())) / 86400000);

function avatar(student, large = false) {
  const initials = student.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const a = el('span', initials, { className: large ? 'avatar lg' : 'avatar' });
  a.style.background = AVATAR_COLORS[(student.id - 1) % AVATAR_COLORS.length];
  return a;
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
  $('shell').hidden = !signedIn;
}

function renderTabs() {
  const tabs = $('tabs');
  tabs.replaceChildren();
  const make = (label, value, icon, count) => {
    const b = el('button', undefined, { type: 'button', className: 'side-item' });
    if (selected === value) b.classList.add('active');
    b.append(icon, el('span', label, { className: 'name' }), el('span', String(count), { className: 'count' }));
    b.onclick = () => {
      selected = value;
      $('filterStatus').value = '';
      render();
    };
    tabs.append(b);
  };
  const allIcon = el('span', 'A', { className: 'avatar all' });
  make('All students', ALL, allIcon, applications.length);
  students.forEach((s) => make(s.name, s.id, avatar(s), applications.filter((a) => a.student_id === s.id).length));
}

function renderSummary(apps) {
  const box = $('summary');
  box.replaceChildren();
  const active = $('filterStatus').value;

  const card = (label, value, status) => {
    const c = el('button', undefined, { type: 'button', className: `stat${status ? ` s-${slug(status)}` : ''}` });
    if ((status ?? '') === active) c.classList.add('on');
    c.append(el('span', label, { className: 'stat-label' }), el('strong', String(value), { className: 'stat-value' }));
    c.onclick = () => {
      $('filterStatus').value = status ?? '';
      render();
    };
    box.append(c);
  };

  card('Total', apps.length, null);
  STATUSES.forEach((st) => card(st, apps.filter((a) => a.status === st).length, st));

  const upcoming = apps
    .filter((a) => a.deadline && !CLOSED.includes(a.status) && daysUntil(a.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const next = el('div', undefined, { className: 'stat next' });
  next.append(
    el('span', 'Next deadline', { className: 'stat-label' }),
    el('strong', upcoming ? fmtDate(upcoming.deadline) : 'None upcoming', { className: 'stat-value' }),
  );
  if (upcoming) next.append(el('span', `${upcoming.university} (${daysUntil(upcoming.deadline)} days)`, { className: 'stat-sub' }));
  box.append(next);
}

function renderProfile() {
  const s = findStudent(selected);
  const box = $('profile');
  box.replaceChildren();
  if (!s) return;
  box.append(avatar(s, true));
  [['Full name', s.full_name], ['Branch', s.branch], ['Grade', s.grade], ['IELTS', s.ielts], ['GRE', s.gre]].forEach(([k, v]) => {
    const item = el('div', undefined, { className: 'pitem' });
    item.append(el('span', k, { className: 'plabel' }), el('span', v || '-'));
    box.append(item);
  });
}

function textCell(value, className) {
  const td = el('td', undefined, className ? { className } : {});
  if (value) td.textContent = value;
  else td.append(el('span', '-', { className: 'dash' }));
  return td;
}

function deadlineCell(a) {
  const td = el('td', undefined, { className: 'deadline' });
  if (!a.deadline) {
    td.append(el('span', '-', { className: 'dash' }));
    return td;
  }
  td.append(el('div', fmtDate(a.deadline)));
  if (!CLOSED.includes(a.status)) {
    const d = daysUntil(a.deadline);
    if (d < 0) td.append(el('span', 'Overdue', { className: 'due due-over' }));
    else if (d <= 14) td.append(el('span', d === 0 ? 'Due today' : `${d} day${d === 1 ? '' : 's'} left`, { className: 'due due-soon' }));
  }
  return td;
}

function renderRows(apps, totalForView) {
  const body = $('rows');
  body.replaceChildren();
  const canDrag = selected !== ALL && !$('search').value.trim() && !$('filterStatus').value;
  $('rows').closest('table').classList.toggle('single', selected !== ALL);
  $('rows').closest('table').classList.toggle('sortable', canDrag);

  byOrder(apps).forEach((a) => {
    const tr = el('tr');

    const dragCell = el('td', undefined, { className: 'col-drag' });
    if (canDrag) {
      const handle = el('span', undefined, { className: 'grip', title: 'Drag to reorder', draggable: true });
      handle.innerHTML = ICON_GRIP;
      handle.ondragstart = (e) => {
        dragId = a.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(tr, 10, 10);
        tr.classList.add('dragging');
      };
      handle.ondragend = () => {
        dragId = null;
        document.querySelectorAll('tr.dragging, tr.drop-target').forEach((r) => r.classList.remove('dragging', 'drop-target'));
      };
      dragCell.append(handle);
      tr.ondragover = (e) => {
        if (!dragId || dragId === a.id) return;
        e.preventDefault();
        tr.classList.add('drop-target');
      };
      tr.ondragleave = () => tr.classList.remove('drop-target');
      tr.ondrop = (e) => {
        e.preventDefault();
        tr.classList.remove('drop-target');
        if (dragId && dragId !== a.id) reorder(dragId, a.id);
      };
    }

    const studentCell = el('td', undefined, { className: 'col-student' });
    const stud = findStudent(a.student_id);
    if (stud) {
      const wrap = el('div', undefined, { className: 'stud' });
      wrap.append(avatar(stud), el('span', stud.name));
      studentCell.append(wrap);
    }

    const uniCell = el('td');
    uniCell.append(el('div', a.university, { className: 'uni' }), el('div', a.program, { className: 'prog' }));

    const greCell = el('td');
    greCell.append(el('span', a.gre, { className: `chip ${a.gre === 'Yes' ? 'chip-yes' : 'chip-no'}` }));

    const portalCell = el('td');
    if (a.portal) portalCell.append(el('span', a.portal, { className: 'chip' }));
    else portalCell.append(el('span', '-', { className: 'dash' }));

    const statusSel = el('select', undefined, { className: `status s-${slug(a.status)}` });
    STATUSES.forEach((s) => statusSel.append(el('option', s, { value: s, selected: s === a.status })));
    statusSel.onchange = async () => {
      await run(db.from('applications').update({ status: statusSel.value }).eq('id', a.id));
      await loadData();
    };
    const statusCell = el('td');
    statusCell.append(statusSel);

    const payment = a.payment ?? '-';
    const paySel = el('select', undefined, { className: `status ${PAY_CLASS[payment]}` });
    PAYMENT.forEach((p) => paySel.append(el('option', p, { value: p, selected: p === payment })));
    paySel.onchange = async () => {
      await run(db.from('applications').update({ payment: paySel.value }).eq('id', a.id));
      await loadData();
    };
    const payCell = el('td');
    payCell.append(paySel);

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
    const actionCell = el('td', undefined, { className: 'row-actions' });
    actionCell.append(edit, del);

    tr.append(dragCell, studentCell, uniCell, deadlineCell(a), textCell(a.ielts), greCell, portalCell, statusCell, payCell, textCell(a.notes), actionCell);
    body.append(tr);
  });

  const empty = $('empty');
  empty.hidden = apps.length > 0;
  empty.textContent = totalForView === 0 ? 'No applications yet.' : 'No applications match your filters.';
}

function render() {
  const base = selected === ALL ? applications : applications.filter((a) => a.student_id === selected);
  const query = $('search').value.trim().toLowerCase();
  const status = $('filterStatus').value;
  const filtered = base.filter((a) => (!status || a.status === status)
    && (!query || `${a.university} ${a.program}`.toLowerCase().includes(query)));

  renderTabs();
  renderSummary(base);
  renderRows(filtered, base.length);
  renderProfile();

  const s = findStudent(selected);
  $('pageTitle').textContent = s ? (s.full_name || s.name) : 'All applications';
  $('pageSub').textContent = s
    ? `${base.length} application${base.length === 1 ? '' : 's'}`
    : `${students.length} students, ${base.length} applications`;
  $('studentBar').hidden = selected === ALL;
  $('addBtn').hidden = selected === ALL;
}

$('filterStatus').append(el('option', 'All statuses', { value: '' }));
STATUSES.forEach((s) => {
  $('filterStatus').append(el('option', s, { value: s }));
  $('status').append(el('option', s, { value: s }));
});
$('portal').append(el('option', '-', { value: '' }));
PORTALS.forEach((p) => $('portal').append(el('option', p, { value: p })));
YES_NO.forEach((v) => $('gre').append(el('option', v, { value: v })));
PAYMENT.forEach((p) => $('payment').append(el('option', p, { value: p })));

$('search').oninput = render;
$('filterStatus').onchange = render;

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
  $('payment').value = app?.payment ?? '-';
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
    payment: $('payment').value,
    notes: $('notes').value.trim() || null,
  };
  const mine = applications.filter((a) => a.student_id === selected);
  await run(editingId
    ? db.from('applications').update(fields).eq('id', editingId)
    : db.from('applications').insert({ ...fields, student_id: selected, position: Math.max(-1, ...mine.map((a) => a.position ?? -1)) + 1 }));
  $('appDialog').close();
  await loadData();
};

$('editProfileBtn').onclick = () => {
  const s = findStudent(selected);
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

function setSidebar(open) {
  $('shell').classList.toggle('collapsed', !open);
  localStorage.setItem('sidebarOpen', open ? '1' : '0');
}
setSidebar(localStorage.getItem('sidebarOpen') !== '0');
$('closeSidebar').onclick = () => setSidebar(false);
$('openSidebar').onclick = () => setSidebar(true);

db.auth.onAuthStateChange((_event, session) => {
  showApp(!!session);
  if (session) loadData();
  else { students = []; applications = []; selected = ALL; }
});
