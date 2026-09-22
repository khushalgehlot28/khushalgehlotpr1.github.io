/* =====================================================
   City Care Hospital - interactive features
   Task 1: Form validation      Task 2: Dynamic greeting
   Task 3: Dynamic bill         Task 4: Show / hide sections
   Task 5: Dynamic text + image
   ===================================================== */

/* ===== Helpers ===== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatINR = n => '₹' + n.toLocaleString('en-IN');
const firstName = n => n.trim().split(' ')[0];


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
        : (v < 1 || v > 120) ? 'Age must be between 1 and 120.' : '',
    password: v => !v ? 'Password is required.'
        : v.length < 8 ? 'Password must be at least 8 characters.'
        : !(/[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v))
            ? 'Include an uppercase letter, a lowercase letter and a number.' : '',
    department: v => v ? '' : 'Please select a department.'
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
        // Once flagged, re-check live so the error clears as soon as it is fixed
        f.addEventListener('input', () => f.classList.contains('invalid') && validateField(f));
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const results = fields.map(validateField);        // validate ALL fields
        if (results.includes(false)) {                    // block submission
            fields[results.indexOf(false)].focus();
            return;
        }
        onSuccess(form);
    });
}

function handleFormSuccess(form) {
    const name = $('#name').value.trim();
    const dept = $('#department').value;

    visitorName = firstName(name);
    saveName(visitorName);
    renderGreeting();

    const status = $('#formStatus');
    status.textContent = `Thank you ${name}! Your ${dept} appointment request has been received.`;
    status.classList.add('show');

    form.reset();
    $$('input, select', form).forEach(f => f.classList.remove('valid', 'invalid'));
}


/* ===== TASK 2: DYNAMIC GREETING ===== */
const NAME_KEY = 'cityCareVisitorName';
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
    { id: 'opd',       name: 'OPD Consultation',        price: 500,  qty: 1 },
    { id: 'blood',     name: 'Blood Test',              price: 400,  qty: 0 },
    { id: 'ecg',       name: 'ECG',                     price: 300,  qty: 0 },
    { id: 'xray',      name: 'X-Ray',                   price: 600,  qty: 0 },
    { id: 'room',      name: 'General Ward (per day)',  price: 2500, qty: 0 },
    { id: 'ambulance', name: 'Ambulance',               price: 1500, qty: 0 }
];

function renderBillRows() {
    $('#billRows').innerHTML = billItems.map(i => `
        <div class="bill-row">
            <span>${i.name}</span>
            <span>${formatINR(i.price)}</span>
            <input type="number" min="0" max="30" value="${i.qty}" id="qty-${i.id}"
                   aria-label="Quantity for ${i.name}">
        </div>`).join('');
}

// Read quantities, compute totals and redraw the summary
function updateBill() {
    const lines = billItems
        .map(i => ({ ...i, qty: Math.min(30, Math.max(0, parseInt($('#qty-' + i.id).value) || 0)) }))
        .filter(l => l.qty > 0);

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const discount = $('#seniorDiscount').checked ? subtotal * 0.1 : 0;
    const row = (label, amount, cls = '') =>
        `<div class="bill-line ${cls}"><span>${label}</span><span>${amount}</span></div>`;

    $('#billSummary').innerHTML = lines.length
        ? lines.map(l => row(`${l.name} × ${l.qty}`, formatINR(l.price * l.qty))).join('') +
          row('Subtotal', formatINR(subtotal)) +
          (discount ? row('Senior citizen discount', '− ' + formatINR(discount)) : '') +
          row('Total', formatINR(subtotal - discount), 'bill-total')
        : '<p>Enter a quantity to see your bill.</p>';
}


/* ===== TASK 4: SHOW / HIDE SECTIONS ===== */
function setSectionVisible(el, show) {
    el.classList.toggle('collapsed', !show);        // CSS handles the fade + slide
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
        const href = a.getAttribute('href');
        const target = $(href === '#contact' ? '#contactInfo' : href);
        if (target && target.classList.contains('collapsed')) setSectionVisible(target, true);
    }));
}


/* ===== TASK 5: DYNAMIC TEXT + IMAGE ===== */
const departments = {
    'Cardiology': {
        emoji: '❤️', colors: ['#0f6156', '#173b36'],
        desc: 'Diagnosis and treatment of heart and blood-vessel conditions, from routine checks to ongoing care.',
        points: ['Visit for: chest pain, high blood pressure, palpitations', 'Common tests: ECG, echocardiogram', 'Ongoing care: heart-health monitoring']
    },
    'Neurology': {
        emoji: '🧠', colors: ['#173b36', '#5b7570'],
        desc: 'Care for the brain, spine and nervous system, including long-term neurological conditions.',
        points: ['Visit for: persistent headaches, seizures, numbness', 'Common tests: EEG, brain imaging', 'Ongoing care: stroke follow-up']
    },
    'Orthopedics': {
        emoji: '🦴', colors: ['#0f6156', '#3a9d8f'],
        desc: 'Treatment of bones, joints, muscles and ligaments for injuries and long-term pain.',
        points: ['Visit for: fractures, joint pain, sports injuries', 'Common tests: X-ray, MRI', 'Ongoing care: physiotherapy guidance']
    },
    'General Medicine': {
        emoji: '🩺', colors: ['#3a9d8f', '#173b36'],
        desc: 'First point of contact for everyday health problems, check-ups and chronic condition management.',
        points: ['Visit for: fever, infections, general weakness', 'Common tests: blood tests, blood pressure', 'Ongoing care: diabetes and BP management']
    },
    'Pediatrics': {
        emoji: '🧒', colors: ['#d64550', '#0f6156'],
        desc: 'Healthcare for infants, children and teenagers, from vaccinations to childhood illnesses.',
        points: ['Visit for: fever, cough, growth concerns', 'Common care: vaccinations, check-ups', 'Ongoing care: child development monitoring']
    }
};

// Build a self-contained SVG picture (swap for real photos by setting img.src to a file path)
function makeImage(key, d) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${d.colors[0]}'/><stop offset='1' stop-color='${d.colors[1]}'/>
        </linearGradient></defs>
        <rect width='600' height='400' fill='url(#g)'/>
        <text x='300' y='215' font-size='120' text-anchor='middle'>${d.emoji}</text>
        <text x='300' y='330' font-size='40' font-weight='bold' fill='white'
              text-anchor='middle' font-family='Arial'>${key}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Fade out, swap text + image, fade back in
function showDepartment(key) {
    const box = $('#explorer'), d = departments[key];
    box.classList.add('fading');
    setTimeout(() => {
        $('#deptImg').src = makeImage(key, d);
        $('#deptImg').alt = key + ' department';
        $('#deptTitle').textContent = key;
        $('#deptDesc').textContent = d.desc;
        $('#deptPoints').innerHTML = d.points.map(x => `<li>${x}</li>`).join('');
        box.classList.remove('fading');
    }, 250);
}

function initExplorer() {
    const select = $('#deptSelect');
    select.innerHTML = Object.keys(departments).map(k => `<option>${k}</option>`).join('');
    select.addEventListener('change', () => showDepartment(select.value));
    showDepartment(select.value);
}


/* ===== INIT ===== */
initFormValidation($('#appointmentForm'), handleFormSuccess);

// Use the name from the form (once it is valid) in the greeting
$('#name').addEventListener('blur', e => {
    const v = e.target.value.trim();
    if (!rules.name(v)) { visitorName = firstName(v); renderGreeting(); }
});

renderGreeting();
setInterval(renderGreeting, 60000);        // keep the greeting current
renderBillRows();
updateBill();
$('#billRows').addEventListener('input', updateBill);
$('#seniorDiscount').addEventListener('change', updateBill);
initToggles();
initExplorer();
