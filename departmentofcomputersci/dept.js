/* =====================================================
   Department of Computer Science - interactive features
   Existing: mobile nav toggle
   Task 1: Form validation      Task 2: Dynamic greeting
   Task 3: Dynamic bill         Task 4: Show / hide sections
   Task 5: Dynamic text + image
   ===================================================== */

/* ===== Helpers ===== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatINR = n => '₹' + n.toLocaleString('en-IN');
const firstName = n => n.trim().split(' ')[0];


/* ===== Existing feature: mobile navigation toggle ===== */
function initMobileNav() {
    const toggle = $('#navToggle'), links = $('#navLinks');
    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
    $$('a', links).forEach(a => a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }));
}


/* ===== TASK 1: FORM VALIDATION =====
   Each rule returns an error message, or '' when the value is valid. */
const rules = {
    name: v => !v ? 'Your name is required.'
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
    program: v => v ? '' : 'Please select a program.',
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
    const program = $('#program').value;

    visitorName = firstName(name);
    saveName(visitorName);
    renderGreeting();

    const status = $('#formStatus');
    status.textContent = `Thank you ${name}! Your enquiry about ${program} has been noted.`;
    status.classList.add('show');

    form.reset();
    $$('input, select, textarea', form).forEach(f => f.classList.remove('valid', 'invalid'));
}


/* ===== TASK 2: DYNAMIC GREETING ===== */
const NAME_KEY = 'deptVisitorName';
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
        getGreeting() + (visitorName ? ', ' + visitorName : '') + '!';
}


/* ===== TASK 3: DYNAMIC BILL ===== */
const billItems = [
    { id: 'tuition',  name: 'Tuition Fee (per semester)',    price: 45000, qty: 1 },
    { id: 'lab',      name: 'Library & Lab (per semester)',  price: 6000,  qty: 1 },
    { id: 'exam',     name: 'Exam Fee (per semester)',       price: 2500,  qty: 0 },
    { id: 'hostel',   name: 'Hostel (per month)',            price: 5000,  qty: 0 },
    { id: 'seminar',  name: 'Seminar Registration',          price: 500,   qty: 0 }
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
    const discount = $('#scholarship').checked ? subtotal * 0.1 : 0;
    const row = (label, amount, cls = '') =>
        `<div class="bill-line ${cls}"><span>${label}</span><span>${amount}</span></div>`;

    $('#billSummary').innerHTML = lines.length
        ? lines.map(l => row(`${l.name} × ${l.qty}`, formatINR(l.price * l.qty))).join('') +
          row('Subtotal', formatINR(subtotal)) +
          (discount ? row('Merit scholarship', '− ' + formatINR(discount)) : '') +
          row('Total', formatINR(subtotal - discount), 'bill-total')
        : '<p>Enter a quantity to see your estimate.</p>';
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
    $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
        const href = a.getAttribute('href');
        const target = $(href === '#contact' ? '#contactInfo' : href);
        if (target && target.classList.contains('collapsed')) setSectionVisible(target, true);
    }));
}


/* ===== TASK 5: DYNAMIC TEXT + IMAGE ===== */
const programs = {
    'BCA': {
        title: 'Bachelor of Computer Applications', level: 'Undergraduate', colors: ['#16233f', '#223056'],
        desc: 'Foundational programming, systems and software development for students starting out in computing.',
        points: ['Level: Undergraduate', 'Focus: programming, databases, web development', 'Careers: developer, tester, IT support']
    },
    'MCA': {
        title: 'Master of Computer Applications', level: 'Postgraduate', colors: ['#223056', '#a9823c'],
        desc: 'Advanced application development and computing practice for graduates moving into professional roles.',
        points: ['Level: Postgraduate', 'Focus: application development, software practice', 'Careers: software engineer, systems analyst']
    },
    'B.Tech': {
        title: 'B.Tech Computer Science', level: 'Undergraduate', colors: ['#16233f', '#4b5468'],
        desc: 'An engineering degree covering algorithms, systems and core computer science theory.',
        points: ['Level: Undergraduate', 'Focus: algorithms, systems, theory', 'Careers: software engineer, data analyst']
    },
    'M.Tech': {
        title: 'M.Tech Computer Science', level: 'Postgraduate', colors: ['#223056', '#16233f'],
        desc: 'A research-oriented graduate degree with focus areas across specialised computing tracks.',
        points: ['Level: Postgraduate', 'Focus: research, specialised computing', 'Careers: researcher, lecturer, senior engineer']
    }
};

// Build a self-contained SVG picture (swap for real photos by setting img.src to a file path)
function makeImage(key, p) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.colors[0]}'/><stop offset='1' stop-color='${p.colors[1]}'/>
        </linearGradient></defs>
        <rect width='600' height='400' fill='url(#g)'/>
        <circle cx='300' cy='170' r='95' fill='none' stroke='#c9a961' stroke-width='2'/>
        <text x='300' y='188' font-size='50' font-style='italic' fill='#c9a961'
              text-anchor='middle' font-family='Georgia, serif'>${key}</text>
        <text x='300' y='330' font-size='26' fill='white' opacity='0.75'
              text-anchor='middle' font-family='Arial'>${p.level}</text></svg>`;
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
    select.innerHTML = Object.keys(programs)
        .map(k => `<option value="${k}">${programs[k].title}</option>`).join('');
    select.addEventListener('change', () => showProgram(select.value));
    showProgram(select.value);
}


/* ===== INIT ===== */
initMobileNav();
initFormValidation($('#contactForm'), handleFormSuccess);

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
$('#scholarship').addEventListener('change', updateBill);
initToggles();
initExplorer();
