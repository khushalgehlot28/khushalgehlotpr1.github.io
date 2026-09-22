/**
 * ABC Online Book Store - interactive features
 *
 * Task 1: Form validation
 * Task 2: Dynamic greeting
 * Task 3: Price calculation / dynamic bill
 * Task 4: Show and hide content
 * Task 5: Dynamic content and image changing
 *
 * Each task lives in its own init function so it can be read, tested
 * or removed independently. They all start once the page has loaded.
 */
(function () {
    'use strict';

    /* =========================================================
       SHARED DATA AND HELPERS
       ========================================================= */

    /** Book catalogue used by both the showcase (Task 5) and the bill (Task 3). */
    const BOOKS = [
        {
            id: 'python',
            title: 'Python Programming',
            author: 'John Smith',
            price: 450,
            category: 'Programming',
            description: 'A beginner-friendly guide to Python, from variables and loops to functions, files and small real-world projects.',
            colors: ['#2f5d8a', '#1b3a5c']
        },
        {
            id: 'webtech',
            title: 'Web Technology',
            author: 'David Brown',
            price: 500,
            category: 'Computer Science',
            description: 'Covers HTML, CSS, JavaScript and how browsers and servers talk to each other, with exercises after every chapter.',
            colors: ['#8a4b2f', '#5c2a1b']
        },
        {
            id: 'dbms',
            title: 'Database Management',
            author: 'Robert Lee',
            price: 550,
            category: 'Computer Science',
            description: 'Explains relational design, SQL queries, normalization and transactions using clear diagrams and worked examples.',
            colors: ['#3c6b4f', '#22412f']
        },
        {
            id: 'startup',
            title: 'The Startup Playbook',
            author: 'Emily Carter',
            price: 620,
            category: 'Business',
            description: 'A practical look at validating an idea, finding first customers and managing money in the early days of a company.',
            colors: ['#7a5a1e', '#4a3510']
        },
        {
            id: 'library',
            title: 'The Silent Library',
            author: 'Arjun Mehta',
            price: 399,
            category: 'Fiction',
            description: 'A mystery about a small-town librarian who finds a book that seems to know what will happen next.',
            colors: ['#6a3a6e', '#3d1f40']
        },
        {
            id: 'aptitude',
            title: 'Quantitative Aptitude Guide',
            author: 'Neha Verma',
            price: 350,
            category: 'Competitive Exams',
            description: 'Shortcuts, formulas and timed practice sets for the maths sections of common competitive exams.',
            colors: ['#a0402c', '#6b2618']
        }
    ];

    const DELIVERY_FEE = 50;
    const FREE_DELIVERY_MIN = 1000;
    const OFFER_RATE = 0.20;

    /** Short alias for getElementById. */
    const $ = (id) => document.getElementById(id);

    /** Format a number as Indian rupees, e.g. 1450 -> "₹1,450". */
    function formatCurrency(amount) {
        return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }

    /** Find a book by its id. */
    function getBookById(id) {
        return BOOKS.find((book) => book.id === id);
    }

    /** Escape text before putting it inside SVG markup. */
    function escapeXml(text) {
        return text.replace(/[<>&"']/g, (c) => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
        }[c]));
    }

    /** Split a title into lines of roughly `max` characters for the cover. */
    function wrapText(text, max) {
        const lines = [];
        let line = '';
        text.split(' ').forEach((word) => {
            if ((line + ' ' + word).trim().length > max) {
                lines.push(line.trim());
                line = word;
            } else {
                line += ' ' + word;
            }
        });
        if (line.trim()) lines.push(line.trim());
        return lines;
    }

    /**
     * Build a book cover as an SVG data URI, so the page needs no image files.
     * If you have real cover images, replace this with `book.image`.
     */
    function createCoverImage(book) {
        const titleLines = wrapText(book.title, 13)
            .map((line, i) =>
                `<text x="130" y="${120 + i * 34}" text-anchor="middle" font-size="27" font-weight="bold" fill="#fff6df">${escapeXml(line)}</text>`)
            .join('');

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="380" viewBox="0 0 260 380" font-family="Georgia, serif">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${book.colors[0]}"/>
      <stop offset="1" stop-color="${book.colors[1]}"/>
    </linearGradient>
  </defs>
  <rect width="260" height="380" fill="url(#g)"/>
  <rect width="18" height="380" fill="rgba(0,0,0,0.25)"/>
  <rect x="34" y="24" width="202" height="332" fill="none" stroke="#d7b06a" stroke-width="2"/>
  <line x1="70" y1="270" x2="190" y2="270" stroke="#d7b06a" stroke-width="2"/>
  ${titleLines}
  <text x="130" y="305" text-anchor="middle" font-size="16" fill="#edd9b1">${escapeXml(book.author)}</text>
</svg>`;

        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
    }


    /* =========================================================
       TASK 2: DYNAMIC GREETING
       ========================================================= */

    /** Name entered by the user; shared between the form and the greeting. */
    let currentUserName = '';

    /** Return greeting text and icon for a given hour (0-23). */
    function getGreetingForHour(hour) {
        if (hour < 12) return { text: 'Good Morning', icon: '🌅' };
        if (hour < 17) return { text: 'Good Afternoon', icon: '☀️' };
        return { text: 'Good Evening', icon: '🌙' };
    }

    /** Write the greeting (with the user's name if we have one) into the page. */
    function updateGreeting() {
        const now = new Date();
        const { text, icon } = getGreetingForHour(now.getHours());
        const name = currentUserName ? ', ' + currentUserName.split(' ')[0] : '';

        $('greetingText').textContent = text + name + '!';
        $('greetingIcon').textContent = icon;
        $('greetingDate').textContent = now.toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }) + ' – welcome to ABC Online Book Store.';
    }

    /** Set the greeting name and refresh the message. */
    function setUserName(name) {
        currentUserName = name.trim();
        updateGreeting();
    }

    function initGreeting() {
        updateGreeting();
        // Re-check every minute so the greeting changes when the time of day does
        setInterval(updateGreeting, 60 * 1000);
    }


    /* =========================================================
       TASK 1: FORM VALIDATION
       ========================================================= */

    /**
     * Each validator receives the field value (and the whole form values)
     * and returns an error message, or '' when the value is valid.
     */
    const validators = {
        name(value) {
            const v = value.trim();
            if (!v) return 'Please enter your full name.';
            if (v.length < 2) return 'Name must be at least 2 characters long.';
            if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(v)) return 'Name can only contain letters and spaces.';
            return '';
        },

        email(value) {
            const v = value.trim();
            if (!v) return 'Please enter your email address.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, like name@example.com.';
            return '';
        },

        phone(value) {
            const v = value.trim();
            if (!v) return 'Please enter your phone number.';
            if (!/^\d+$/.test(v)) return 'Phone number must contain digits only.';
            if (v.length !== 10) return 'Phone number must be exactly 10 digits.';
            if (!/^[6-9]/.test(v)) return 'Mobile numbers start with 6, 7, 8 or 9.';
            return '';
        },

        age(value) {
            const v = value.trim();
            if (!v) return 'Please enter your age.';
            if (!/^\d+$/.test(v)) return 'Age must be a whole number.';
            const age = Number(v);
            if (age < 13) return 'You must be at least 13 years old.';
            if (age > 100) return 'Please enter an age of 100 or less.';
            return '';
        },

        password(value) {
            if (!value) return 'Please create a password.';
            if (value.length < 8) return 'Password must be at least 8 characters long.';
            if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter.';
            if (!/[a-z]/.test(value)) return 'Add at least one lowercase letter.';
            if (!/\d/.test(value)) return 'Add at least one number.';
            return '';
        },

        confirmPassword(value, values) {
            if (!value) return 'Please confirm your password.';
            if (value !== values.password) return 'Passwords do not match.';
            return '';
        }
    };

    /** Collect the current value of every validated field. */
    function getFormValues(form) {
        const values = {};
        Object.keys(validators).forEach((field) => {
            values[field] = form.elements[field].value;
        });
        return values;
    }

    /** Show or clear the error state for one field. Returns true if valid. */
    function validateField(form, fieldName) {
        const input = form.elements[fieldName];
        const wrapper = input.closest('.field');
        const errorEl = $(fieldName + 'Error');
        const message = validators[fieldName](input.value, getFormValues(form));

        errorEl.textContent = message;
        wrapper.classList.toggle('invalid', Boolean(message));
        wrapper.classList.toggle('valid', !message);
        input.setAttribute('aria-invalid', message ? 'true' : 'false');

        return !message;
    }

    /** Validate every field; returns the name of the first invalid field or null. */
    function validateAll(form) {
        let firstInvalid = null;
        Object.keys(validators).forEach((field) => {
            if (!validateField(form, field) && !firstInvalid) firstInvalid = field;
        });
        return firstInvalid;
    }

    /** Show a message box under the form. */
    function showFormMessage(type, text) {
        const box = $('formMessage');
        box.className = 'form-message show ' + type;
        box.textContent = text;
    }

    /** Remove all error/valid styling (used on reset). */
    function clearFormState(form) {
        form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid', 'valid'));
        form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
        $('formMessage').className = 'form-message';
    }

    function initFormValidation() {
        const form = $('registerForm');
        const touched = new Set(); // fields the user has already left once

        Object.keys(validators).forEach((field) => {
            const input = form.elements[field];

            // Validate when the user leaves the field...
            input.addEventListener('blur', () => {
                touched.add(field);
                validateField(form, field);
            });

            // ...and validate live while typing once the field has been touched
            input.addEventListener('input', () => {
                if (touched.has(field)) validateField(form, field);

                // Keep "confirm password" in sync when the password changes
                if (field === 'password' && touched.has('confirmPassword')) {
                    validateField(form, 'confirmPassword');
                }
            });
        });

        // Phone: silently strip anything that is not a digit
        form.elements.phone.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Live name -> greeting (only when the name is valid)
        form.elements.name.addEventListener('input', (e) => {
            setUserName(validators.name(e.target.value) ? '' : e.target.value);
        });

        // Show / hide password buttons
        form.querySelectorAll('.toggle-pass').forEach((btn) => {
            btn.addEventListener('click', () => {
                const input = $(btn.dataset.target);
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.textContent = show ? 'Hide' : 'Show';
                btn.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + input.previousElementSibling?.textContent);
            });
        });

        // Submit: block it until every field passes
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const firstInvalid = validateAll(form);
            Object.keys(validators).forEach((f) => touched.add(f));

            if (firstInvalid) {
                showFormMessage('error', 'Please fix the highlighted fields and try again.');
                form.elements[firstInvalid].focus();
                return;
            }

            const name = form.elements.name.value.trim();
            setUserName(name);
            showFormMessage('success', 'Thank you, ' + name + '! Your account has been created.');

            // Clear the fields but keep the success message and greeting
            form.reset();
            touched.clear();
            form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid', 'valid'));
        });

        // Reset button also clears errors
        form.addEventListener('reset', () => {
            touched.clear();
            clearFormState(form);
        });
    }


    /* =========================================================
       TASK 3: PRICE CALCULATION / DYNAMIC BILL
       ========================================================= */

    /** Build one table row per book in the calculator. */
    function renderBillRows() {
        $('billBody').innerHTML = BOOKS.map((book) => `
            <tr>
                <td>${escapeXml(book.title)}</td>
                <td>${formatCurrency(book.price)}</td>
                <td>
                    <input type="number" class="qty-input" min="0" max="99" value="0"
                           data-id="${book.id}" aria-label="Quantity for ${escapeXml(book.title)}">
                </td>
                <td id="line-${book.id}">${formatCurrency(0)}</td>
            </tr>`).join('');
    }

    /** Read a quantity input as a safe whole number between 0 and 99. */
    function readQuantity(input) {
        const qty = parseInt(input.value, 10);
        if (Number.isNaN(qty) || qty < 0) return 0;
        return Math.min(qty, 99);
    }

    /**
     * Pure calculation: takes an array of {book, qty} and returns the totals.
     * Kept separate from the DOM so it is easy to test.
     */
    function calculateBill(lines, applyOffer) {
        const subtotal = lines.reduce((sum, l) => sum + l.book.price * l.qty, 0);
        const discount = applyOffer ? subtotal * OFFER_RATE : 0;
        const afterDiscount = subtotal - discount;
        const delivery = subtotal === 0 || afterDiscount >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
        return { subtotal, discount, delivery, total: afterDiscount + delivery };
    }

    /** Recalculate everything and update the bill summary. */
    function updateBill() {
        const lines = [];

        document.querySelectorAll('.qty-input').forEach((input) => {
            const book = getBookById(input.dataset.id);
            const qty = readQuantity(input);
            $('line-' + book.id).textContent = formatCurrency(book.price * qty);
            if (qty > 0) lines.push({ book, qty });
        });

        const totals = calculateBill(lines, $('applyOffer').checked);

        // Itemised list
        $('billItems').innerHTML = lines.length
            ? lines.map((l) => `<li><span>${escapeXml(l.book.title)} × ${l.qty}</span><span>${formatCurrency(l.book.price * l.qty)}</span></li>`).join('')
            : '<li class="bill-empty">No books added yet.</li>';

        $('billSubtotal').textContent = formatCurrency(totals.subtotal);
        $('billDiscount').textContent = '−' + formatCurrency(totals.discount);
        $('billDelivery').textContent = totals.delivery ? formatCurrency(totals.delivery) : (totals.subtotal ? 'Free' : formatCurrency(0));
        $('billTotal').textContent = formatCurrency(totals.total);
    }

    /** Set the quantity of one book programmatically (used by the showcase). */
    function addBookToBill(bookId) {
        const input = document.querySelector(`.qty-input[data-id="${bookId}"]`);
        if (!input) return 0;
        input.value = Math.min(readQuantity(input) + 1, 99);
        updateBill();
        return readQuantity(input);
    }

    function initBill() {
        renderBillRows();

        // One listener on the table body handles every quantity input
        $('billBody').addEventListener('input', updateBill);
        $('applyOffer').addEventListener('change', updateBill);

        $('clearBillBtn').addEventListener('click', () => {
            document.querySelectorAll('.qty-input').forEach((i) => { i.value = 0; });
            updateBill();
        });

        updateBill();
    }


    /* =========================================================
       TASK 5: DYNAMIC CONTENT AND IMAGE CHANGING
       ========================================================= */

    let selectedBookId = BOOKS[0].id;

    /** Put a book's details and cover into the showcase card. */
    function fillShowcase(book) {
        const img = $('bookImage');
        img.src = createCoverImage(book);
        img.alt = 'Cover of ' + book.title + ' by ' + book.author;

        $('bookCategory').textContent = book.category;
        $('bookTitle').textContent = book.title;
        $('bookAuthor').textContent = 'by ' + book.author;
        $('bookDescription').textContent = book.description;
        $('bookPrice').textContent = formatCurrency(book.price);
        $('addToBillNote').textContent = '';
    }

    /** Show a book with a short fade so the change feels smooth. */
    function showBook(bookId) {
        const book = getBookById(bookId);
        if (!book) return;

        selectedBookId = bookId;
        $('bookSelect').value = bookId;

        const card = $('showcaseCard');
        card.classList.add('fading');
        setTimeout(() => {
            fillShowcase(book);
            card.classList.remove('fading');
        }, 250);
    }

    function initShowcase() {
        const select = $('bookSelect');
        select.innerHTML = BOOKS.map((b) => `<option value="${b.id}">${escapeXml(b.title)}</option>`).join('');

        // Show the first book straight away (no fade on page load)
        select.value = selectedBookId;
        fillShowcase(getBookById(selectedBookId));

        select.addEventListener('change', () => showBook(select.value));

        // "Next book" cycles through the list and wraps around
        $('nextBookBtn').addEventListener('click', () => {
            const index = BOOKS.findIndex((b) => b.id === selectedBookId);
            showBook(BOOKS[(index + 1) % BOOKS.length].id);
        });

        // Add the shown book to the bill calculator
        $('addToBillBtn').addEventListener('click', () => {
            const qty = addBookToBill(selectedBookId);
            $('addToBillNote').textContent = 'Added. You now have ' + qty + ' in your order (see Order Calculator).';
        });
    }


    /* =========================================================
       TASK 4: SHOW AND HIDE CONTENT
       ========================================================= */

    /** Open or close one collapsible panel and sync its button. */
    function setPanelState(panelId, open) {
        const panel = $(panelId);
        panel.classList.toggle('open', open);

        const button = document.querySelector(`.toggle-btn[data-target="${panelId}"]`);
        if (button) button.setAttribute('aria-expanded', String(open));
    }

    /** Update the "Show all / Hide all" label based on current state. */
    function updateToggleAllLabel() {
        const allOpen = [...document.querySelectorAll('.collapsible')].every((p) => p.classList.contains('open'));
        $('toggleAllBtn').textContent = allOpen ? 'Hide all' : 'Show all';
    }

    function initToggles() {
        // Individual buttons
        document.querySelectorAll('.toggle-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                setPanelState(btn.dataset.target, !isOpen);
                updateToggleAllLabel();
            });
        });

        // Show all / Hide all
        $('toggleAllBtn').addEventListener('click', () => {
            const shouldOpen = $('toggleAllBtn').textContent === 'Show all';
            document.querySelectorAll('.collapsible').forEach((p) => setPanelState(p.id, shouldOpen));
            updateToggleAllLabel();
        });

        // Nav links with data-opens (e.g. "Contact Us") also expand their panel
        document.querySelectorAll('[data-opens]').forEach((link) => {
            link.addEventListener('click', () => {
                setPanelState(link.dataset.opens, true);
                updateToggleAllLabel();
            });
        });
    }


    /* =========================================================
       START EVERYTHING
       ========================================================= */
    document.addEventListener('DOMContentLoaded', () => {
        initGreeting();
        initFormValidation();
        initBill();
        initShowcase();
        initToggles();
    });
})();
