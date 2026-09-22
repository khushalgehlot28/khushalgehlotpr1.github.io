/**
 * Food Corner Restaurant - interactive features
 *
 * Task 1: Form validation
 * Task 2: Dynamic greeting
 * Task 3: Price calculation / dynamic bill
 * Task 4: Show and hide content
 * Task 5: Dynamic content and image changing
 *
 * Each task has its own init function, so it can be read, tested or
 * removed independently. Everything starts after the page has loaded.
 */
(function () {
    'use strict';

    /* =========================================================
       SHARED DATA AND HELPERS
       ========================================================= */

    /**
     * Menu used by both the dish showcase (Task 5) and the bill (Task 3).
     * `categoryClass` reuses the badge colours already defined in the CSS.
     */
    const DISHES = [
        {
            id: 'pizza', name: 'Pizza', price: 250, category: 'Italian', categoryClass: 'italian',
            emoji: '🍕', bg: ['#f7d9a8', '#e9a95c'],
            description: 'A hand-stretched crust topped with tangy tomato sauce, melted mozzarella and fresh vegetables, baked until golden.'
        },
        {
            id: 'paneer', name: 'Paneer Tikka', price: 180, category: 'Indian', categoryClass: 'indian',
            emoji: '🍢', bg: ['#f3b9a8', '#d3654f'],
            description: 'Soft paneer cubes marinated in spiced yogurt and grilled in the tandoor with peppers and onions.'
        },
        {
            id: 'burger', name: 'Veg Burger', price: 120, category: 'Fast Food', categoryClass: 'fastfood',
            emoji: '🍔', bg: ['#fbe2a0', '#e8a33d'],
            description: 'A crisp veggie patty with lettuce, tomato and our house sauce in a toasted sesame bun.'
        },
        {
            id: 'coffee', name: 'Cold Coffee', price: 100, category: 'Beverage', categoryClass: 'beverage',
            emoji: '🧋', bg: ['#bfdcd9', '#4c7a78'],
            description: 'Chilled, creamy coffee blended with ice and a touch of sweetness. Perfect on a warm afternoon.'
        },
        {
            id: 'pasta', name: 'Pasta Alfredo', price: 220, category: 'Italian', categoryClass: 'italian',
            emoji: '🍝', bg: ['#dfe6c3', '#8fa163'],
            description: 'Penne tossed in a rich, creamy white sauce with garlic, herbs and mushrooms.'
        },
        {
            id: 'biryani', name: 'Veg Biryani', price: 200, category: 'Indian', categoryClass: 'indian',
            emoji: '🍛', bg: ['#f0c9b8', '#b5544d'],
            description: 'Fragrant basmati rice slow-cooked with vegetables and whole spices, served with cool raita.'
        }
    ];

    const GST_RATE = 0.05;
    const DELIVERY_FEE = 40;
    const FREE_DELIVERY_MIN = 500;

    /** Short alias for getElementById. */
    const $ = (id) => document.getElementById(id);

    /** Format a number as Indian rupees, e.g. 1450 -> "₹1,450". */
    function formatCurrency(amount) {
        return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }

    /** Find a dish by id. */
    function getDishById(id) {
        return DISHES.find((dish) => dish.id === id);
    }

    /** Escape text before inserting it into HTML or SVG markup. */
    function escapeHtml(text) {
        return String(text).replace(/[<>&"']/g, (c) => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /**
     * Draw a dish picture as an SVG data URI (a plate with the dish emoji),
     * so no image files are needed. To use real photos, add an `image`
     * field to each dish and use it in fillShowcase() instead.
     */
    function createDishImage(dish) {
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="${dish.bg[0]}"/>
      <stop offset="1" stop-color="${dish.bg[1]}"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="215" r="150" fill="#fffaf2" opacity="0.9"/>
  <circle cx="200" cy="215" r="120" fill="none" stroke="#e6d3b3" stroke-width="4"/>
  <text x="200" y="255" text-anchor="middle" font-size="130">${dish.emoji}</text>
  <text x="200" y="372" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" font-weight="bold" fill="#2b1b17">${escapeHtml(dish.name)}</text>
</svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
    }


    /* =========================================================
       TASK 2: DYNAMIC GREETING
       ========================================================= */

    /** Name entered by the user; shared between the form and the greeting. */
    let currentUserName = '';

    /** Return the greeting text and icon for an hour (0-23). */
    function getGreetingForHour(hour) {
        if (hour < 12) return { text: 'Good Morning', icon: '🌅', sub: 'Start your day with a fresh breakfast.' };
        if (hour < 17) return { text: 'Good Afternoon', icon: '☀️', sub: 'Time for a tasty lunch.' };
        return { text: 'Good Evening', icon: '🌙', sub: 'Dinner is served until 10:00 PM.' };
    }

    /** Write the greeting (with the user's first name if known) into the page. */
    function updateGreeting() {
        const { text, icon, sub } = getGreetingForHour(new Date().getHours());
        const firstName = currentUserName.split(' ')[0];

        $('greetingText').textContent = text + (firstName ? ', ' + firstName : '') + '!';
        $('greetingIcon').textContent = icon;
        $('greetingSub').textContent = sub;
    }

    /** Set the name used in the greeting and refresh the message. */
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
     * Each validator gets the field value (and all form values) and returns
     * an error message, or '' when the value is valid.
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

    /** Show or clear the error for one field. Returns true if valid. */
    function validateField(form, fieldName) {
        const input = form.elements[fieldName];
        const wrapper = input.closest('.field');
        const message = validators[fieldName](input.value, getFormValues(form));

        $(fieldName + 'Error').textContent = message;
        wrapper.classList.toggle('invalid', Boolean(message));
        wrapper.classList.toggle('valid', !message);
        input.setAttribute('aria-invalid', message ? 'true' : 'false');

        return !message;
    }

    /** Validate every field; returns the first invalid field name, or null. */
    function validateAll(form) {
        let firstInvalid = null;
        Object.keys(validators).forEach((field) => {
            if (!validateField(form, field) && !firstInvalid) firstInvalid = field;
        });
        return firstInvalid;
    }

    /** Show a success or error message under the form. */
    function showFormMessage(type, text) {
        const box = $('formMessage');
        box.className = 'form-message show ' + type;
        box.textContent = text;
    }

    /** Remove all error/valid styling. */
    function clearFieldStates(form) {
        form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid', 'valid'));
        form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
    }

    function initFormValidation() {
        const form = $('signupForm');
        const touched = new Set(); // fields the user has already left once

        Object.keys(validators).forEach((field) => {
            const input = form.elements[field];

            // Validate when the user leaves the field
            input.addEventListener('blur', () => {
                touched.add(field);
                validateField(form, field);
            });

            // Then validate live while typing
            input.addEventListener('input', () => {
                if (touched.has(field)) validateField(form, field);
                if (field === 'password' && touched.has('confirmPassword')) {
                    validateField(form, 'confirmPassword');
                }
            });
        });

        // Phone: strip anything that is not a digit as the user types
        form.elements.phone.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Valid name -> personalised greeting
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
                btn.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + (input.id === 'password' ? 'password' : 'confirm password'));
            });
        });

        // Submit is blocked until every field passes
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
            showFormMessage('success', 'Welcome to the club, ' + name + '! We will keep you posted.');

            form.reset();
            touched.clear();
            clearFieldStates(form);
        });

        // The Clear button also removes errors and the message
        form.addEventListener('reset', () => {
            touched.clear();
            clearFieldStates(form);
            $('formMessage').className = 'form-message';
        });
    }


    /* =========================================================
       TASK 3: PRICE CALCULATION / DYNAMIC BILL
       ========================================================= */

    /** Build one table row per dish. */
    function renderBillRows() {
        $('billBody').innerHTML = DISHES.map((dish) => `
            <tr>
                <td>${escapeHtml(dish.name)}</td>
                <td>${formatCurrency(dish.price)}</td>
                <td>
                    <input type="number" class="qty-input" min="0" max="99" value="0"
                           data-id="${dish.id}" aria-label="Quantity for ${escapeHtml(dish.name)}">
                </td>
                <td id="line-${dish.id}">${formatCurrency(0)}</td>
            </tr>`).join('');
    }

    /** Read a quantity input as a whole number from 0 to 99. */
    function readQuantity(input) {
        const qty = parseInt(input.value, 10);
        if (Number.isNaN(qty) || qty < 0) return 0;
        return Math.min(qty, 99);
    }

    /**
     * Pure calculation (no DOM): takes [{dish, qty}] and a service type,
     * returns subtotal, tax, delivery and total.
     */
    function calculateBill(lines, serviceType) {
        const subtotal = lines.reduce((sum, l) => sum + l.dish.price * l.qty, 0);
        const tax = subtotal * GST_RATE;
        const charge = serviceType === 'delivery' && subtotal > 0 && subtotal < FREE_DELIVERY_MIN;
        const delivery = charge ? DELIVERY_FEE : 0;
        return { subtotal, tax, delivery, total: subtotal + tax + delivery };
    }

    /** Recalculate and redraw the bill summary. */
    function updateBill() {
        const lines = [];

        document.querySelectorAll('.qty-input').forEach((input) => {
            const dish = getDishById(input.dataset.id);
            const qty = readQuantity(input);
            $('line-' + dish.id).textContent = formatCurrency(dish.price * qty);
            if (qty > 0) lines.push({ dish, qty });
        });

        const serviceType = $('serviceType').value;
        const totals = calculateBill(lines, serviceType);

        $('billItems').innerHTML = lines.length
            ? lines.map((l) => `<li><span>${escapeHtml(l.dish.name)} × ${l.qty}</span><span>${formatCurrency(l.dish.price * l.qty)}</span></li>`).join('')
            : '<li class="bill-empty">No items added yet.</li>';

        $('billSubtotal').textContent = formatCurrency(totals.subtotal);
        $('billTax').textContent = formatCurrency(totals.tax);
        $('billDelivery').textContent = serviceType !== 'delivery' ? '–' : (totals.delivery ? formatCurrency(totals.delivery) : (totals.subtotal ? 'Free' : formatCurrency(0)));
        $('billTotal').textContent = formatCurrency(totals.total);
    }

    /** Add one of a dish to the order (used by the showcase). Returns new quantity. */
    function addDishToOrder(dishId) {
        const input = document.querySelector(`.qty-input[data-id="${dishId}"]`);
        if (!input) return 0;
        input.value = Math.min(readQuantity(input) + 1, 99);
        updateBill();
        return readQuantity(input);
    }

    function initBill() {
        renderBillRows();

        // One listener on the table body handles all quantity inputs
        $('billBody').addEventListener('input', updateBill);
        $('serviceType').addEventListener('change', updateBill);

        $('clearBillBtn').addEventListener('click', () => {
            document.querySelectorAll('.qty-input').forEach((i) => { i.value = 0; });
            updateBill();
        });

        updateBill();
    }


    /* =========================================================
       TASK 5: DYNAMIC CONTENT AND IMAGE CHANGING
       ========================================================= */

    let selectedDishId = DISHES[0].id;

    /** Put a dish's details and picture into the showcase card. */
    function fillShowcase(dish) {
        const img = $('dishImage');
        img.src = createDishImage(dish);
        img.alt = 'Illustration of ' + dish.name;

        const badge = $('dishCategory');
        badge.textContent = dish.category;
        badge.className = 'category ' + dish.categoryClass;

        $('dishTitle').textContent = dish.name;
        $('dishDescription').textContent = dish.description;
        $('dishPrice').textContent = formatCurrency(dish.price);
        $('addToOrderNote').textContent = '';
    }

    /** Switch to another dish with a short fade. */
    function showDish(dishId) {
        const dish = getDishById(dishId);
        if (!dish) return;

        selectedDishId = dishId;
        $('dishSelect').value = dishId;

        const card = $('showcaseCard');
        card.classList.add('fading');
        setTimeout(() => {
            fillShowcase(dish);
            card.classList.remove('fading');
        }, 250);
    }

    function initShowcase() {
        const select = $('dishSelect');
        select.innerHTML = DISHES.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
        select.value = selectedDishId;
        fillShowcase(getDishById(selectedDishId)); // first dish, no fade on load

        select.addEventListener('change', () => showDish(select.value));

        // "Next dish" cycles through the list and wraps around
        $('nextDishBtn').addEventListener('click', () => {
            const index = DISHES.findIndex((d) => d.id === selectedDishId);
            showDish(DISHES[(index + 1) % DISHES.length].id);
        });

        // Add the shown dish to the bill
        $('addToOrderBtn').addEventListener('click', () => {
            const qty = addDishToOrder(selectedDishId);
            $('addToOrderNote').textContent = 'Added. You now have ' + qty + ' in your order (see Build Your Order).';
        });
    }


    /* =========================================================
       TASK 4: SHOW AND HIDE CONTENT
       ========================================================= */

    /** Open or close a panel and update its button text and aria state. */
    function setPanelState(panelId, open) {
        $(panelId).classList.toggle('open', open);

        const button = document.querySelector(`.toggle-btn[data-target="${panelId}"]`);
        if (button) {
            button.setAttribute('aria-expanded', String(open));
            button.textContent = (open ? 'Hide ' : 'Show ') + button.dataset.label;
        }
    }

    function initToggles() {
        document.querySelectorAll('.toggle-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                setPanelState(btn.dataset.target, !isOpen);
            });
        });

        // Nav links with data-opens (e.g. "Contact") also expand their panel
        document.querySelectorAll('[data-opens]').forEach((link) => {
            link.addEventListener('click', () => setPanelState(link.dataset.opens, true));
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
