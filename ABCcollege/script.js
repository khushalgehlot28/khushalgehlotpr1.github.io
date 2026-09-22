/* ===== Helpers ===== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatINR = n => '₹' + n.toLocaleString('en-IN');

// Display current year
$('#year').textContent = new Date().getFullYear();


/* ===== TASK 1: FORM VALIDATION =====
   Each rule returns an error message, or '' when the value is valid. */
const rules = {
    name: v => !v ? 'Full name is required.'
        : !/^[A-Za-z][A-Za-z .'-]{2,}$/.test(v) ? 'Use at least 3 letters (letters and spaces only).' : '',
    email: v => !v ? 'Email is required.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email, e.g. name@example.com.' : '',
    phone: v => {
        const p = v.replace(/[\s-]/g, '');
        return !p ? 'Phone number is required.'
            : !/^(\+91)?[6-9]\d{9}$/.test(p) ? 'Enter a valid 10-digit mobile number.' : '';
    },
    age: v => !v ? 'Age is required.'
        : !/^\d+$/.test(v) ? 'Age must be a whole number.'
        : (v < 16 || v > 60) ? 'Age must be between 16 and 60.' : '',
    password: v => !v ? 'Password is required.'
        : v.length < 8 ? 'Password must be at least 8 characters.'
        : !(/[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v))
            ? 'Include an uppercase letter, a lowercase letter and a number.' : '',
    course: v => v ? '' : 'Please select a course.',
    message: v => !v ? 'Message is required.'
        : v.length < 10 ? 'Message must be at least 10 characters.' : ''
};

// Validate one field, show/clear its error, return true if valid
function validateField(field) {
    const value = field.id === 'password' ? field.value : field.value.trim();
    const error = rules[field.id](value);
    $('#err-' + field.id).textContent = error;
    field.classList.toggle('invalid', !!error);
    field.classList.toggle('valid', !error);
    field.setAttribute('aria-invalid', !!error);
    return !error;
}

// Attach validation to a form; onSuccess runs only when every field passes
function initFormValidation(form, onSuccess) {
    const fields = $$('input, select, textarea', form);

    fields.forEach(f => {
        f.insertAdjacentHTML('afterend',
            `<small class="error-msg" id="err-${f.id}" role="alert"></small>`);
        f.addEventListener('blur', () => validateField(f));
        f.addEventListener('change', () => validateField(f));
        // Once a field is flagged, re-check live so the error clears as soon as it's fixed
        f.addEventListener('input', () => f.classList.contains('invalid') && validateField(f));
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const results = fields.map(validateField);      // validate ALL fields
        if (results.includes(false)) {                  // block submission
            fields[results.indexOf(false)].focus();
            return;
        }
        onSuccess(form);
    });
}

function handleFormSuccess(form) {
    const name = $('#name').value.trim();
    saveName(name.split(' ')[0]);
    visitorName = name.split(' ')[0];
    renderGreeting();

    const status = $('#formStatus');
    status.textContent = `Thank you ${name}! Your enquiry has been submitted.`;
    status.classList.add('show');

    form.reset();
    $$('input, select, textarea', form).forEach(f => f.classList.remove('valid', 'invalid'));
}


/* ===== TASK 2: DYNAMIC GREETING ===== */
const NAME_KEY = 'abcVisitorName';
function loadName() { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } }
function saveName(n) { try { localStorage.setItem(NAME_KEY, n); } catch { /* storage unavailable */ } }
let visitorName = loadName();

// Pick a greeting from the hour of the day (0-23)
function getGreeting(hour = new Date().getHours()) {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

function renderGreeting() {
    $('#greeting').textContent =
        getGreeting() + (visitorName ? ', ' + visitorName : '') + '! 👋';
}


/* ===== TASK 3: DYNAMIC BILL ===== */
const billItems = [
    { id: 'tuition',   name: 'Tuition Fee (per semester)',  price: 40000, qty: 1 },
    { id: 'hostel',    name: 'Hostel (per month)',          price: 5000,  qty: 0 },
    { id: 'transport', name: 'Transport (per month)',       price: 1500,  qty: 0 },
    { id: 'lab',       name: 'Lab & Library (per semester)', price: 8000, qty: 0 },
    { id: 'training',  name: 'Placement Training',          price: 10000, qty: 0 }
];

function renderBillRows() {
    $('#billRows').innerHTML = billItems.map(i => `
        <div class="bill-row">
            <span>${i.name}</span>
            <span>${formatINR(i.price)}</span>
            <input type="number" min="0" max="12" value="${i.qty}" id="qty-${i.id}"
                   aria-label="Quantity for ${i.name}">
        </div>`).join('');
}

// Read quantities, compute totals and redraw the summary
function updateBill() {
    const lines = billItems
        .map(i => ({ ...i, qty: Math.min(12, Math.max(0, parseInt($('#qty-' + i.id).value) || 0)) }))
        .filter(l => l.qty > 0);

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const discount = $('#earlyBird').checked ? subtotal * 0.1 : 0;
    const row = (label, amount, cls = '') =>
        `<div class="bill-line ${cls}"><span>${label}</span><span>${amount}</span></div>`;

    $('#billSummary').innerHTML = lines.length
        ? lines.map(l => row(`${l.name} × ${l.qty}`, formatINR(l.price * l.qty))).join('') +
          row('Subtotal', formatINR(subtotal)) +
          (discount ? row('Early-bird discount', '− ' + formatINR(discount)) : '') +
          row('Total', formatINR(subtotal - discount), 'bill-total')
        : '<p>Enter a quantity to see your bill.</p>';
}


/* ===== TASK 4: SHOW / HIDE SECTIONS ===== */
function setSectionVisible(el, show) {
    el.classList.toggle('collapsed', !show);      // CSS handles the fade + slide
    el.setAttribute('aria-hidden', !show);
    const btn = $(`.toggle-btn[data-target="${el.id}"]`);
    if (btn) btn.setAttribute('aria-pressed', show);
}

function initToggles() {
    $$('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
        const target = $('#' + btn.dataset.target);
        setSectionVisible(target, target.classList.contains('collapsed'));
    }));

    // Clicking a nav link to a hidden section re-opens it first
    $$('nav a').forEach(a => a.addEventListener('click', () => {
        const target = $(a.getAttribute('href'));
        if (target && target.classList.contains('collapsed')) setSectionVisible(target, true);
    }));
}


/* ===== TASK 5: DYNAMIC TEXT + IMAGE ===== */
const programs = {
    'BCA': {
        title: 'Bachelor of Computer Applications', emoji: '💻', colors: ['#14213d', '#1d3557'],
        desc: 'An undergraduate programme that builds a strong base in programming, databases and web development.',
        points: ['Duration: 3 years', 'Focus: programming, databases, web', 'Careers: web developer, tester, IT support']
    },
    'MCA': {
        title: 'Master of Computer Applications', emoji: '🚀', colors: ['#1d3557', '#457b9d'],
        desc: 'A postgraduate programme covering advanced software development and modern computing technologies.',
        points: ['Duration: 2 years', 'Focus: software engineering, cloud', 'Careers: software engineer, systems analyst']
    },
    'B.Tech': {
        title: 'B.Tech Computer Science', emoji: '⚙️', colors: ['#14213d', '#6a4c93'],
        desc: 'Study computer science, algorithms and engineering concepts with hands-on lab work.',
        points: ['Duration: 4 years', 'Focus: algorithms, systems, AI', 'Careers: developer, data analyst, ML engineer']
    },
    'M.Tech': {
        title: 'M.Tech Computer Science', emoji: '🔬', colors: ['#0b132b', '#2a9d8f'],
        desc: 'Advanced technical education with a research focus and specialised areas of computing.',
        points: ['Duration: 2 years', 'Focus: research, specialisation', 'Careers: researcher, lecturer, senior engineer']
    }
};

// Build a self-contained SVG picture (swap for real photos by setting img.src to a file path)
function makeImage(key, p) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.colors[0]}'/><stop offset='1' stop-color='${p.colors[1]}'/>
        </linearGradient></defs>
        <rect width='600' height='400' fill='url(#g)'/>
        <text x='300' y='215' font-size='120' text-anchor='middle'>${p.emoji}</text>
        <text x='300' y='330' font-size='44' font-weight='bold' fill='#fca311'
              text-anchor='middle' font-family='Arial'>${key}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Fade out, swap text + image, fade back in
function showProgram(key) {
    const box = $('#explorer'), p = programs[key];
    box.classList.add('fading');
    setTimeout(() => {
        $('#programImg').src = makeImage(key, p);
        $('#programImg').alt = p.title;
        $('#programTitle').textContent = p.title;
        $('#programDesc').textContent = p.desc;
        $('#programPoints').innerHTML = p.points.map(x => `<li>${x}</li>`).join('');
        box.classList.remove('fading');
    }, 250);
}

function initExplorer() {
    const select = $('#programSelect');
    select.innerHTML = Object.keys(programs).map(k => `<option value="${k}">${programs[k].title}</option>`).join('');
    select.addEventListener('change', () => showProgram(select.value));
    showProgram(select.value);
}


/* ===== INIT ===== */
initFormValidation($('#contactForm'), handleFormSuccess);

// Use the name from the form (once it is valid) in the greeting
$('#name').addEventListener('blur', e => {
    const v = e.target.value.trim();
    if (!rules.name(v)) { visitorName = v.split(' ')[0]; renderGreeting(); }
});

renderGreeting();
setInterval(renderGreeting, 60000);      // keep the greeting current
renderBillRows();
updateBill();
$('#billRows').addEventListener('input', updateBill);
$('#earlyBird').addEventListener('change', updateBill);
initToggles();
initExplorer();
