/* ---------- Helpers ---------- */
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TRACKER_CONFIG = {
    'rate-my-day': {
        title: '⭐ Rate My Day',
        subtitle: 'Click each day to rate it from 1★ to 5★ with a color.',
        options: [
            { value: 1, label: '1★', bg: '#ff8fa3', color: '#ffffff' },
            { value: 2, label: '2★', bg: '#ffb480', color: '#ffffff' },
            { value: 3, label: '3★', bg: '#ffe066', color: '#5d4e6d' },
            { value: 4, label: '4★', bg: '#8ce99a', color: '#2b5a34' },
            { value: 5, label: '5★', bg: '#b197fc', color: '#ffffff' }
        ]
    },
    'physical-mental-health': {
        title: '🧘‍♀️ Physical & Mental Health',
        subtitle: 'Click each day to mark your health status.',
        options: [
            { value: 'perfect-physical', label: 'Perfect Physical Health', bg: '#ff9f68', color: '#ffffff' },
            { value: 'sick', label: 'Sick', bg: '#e85d75', color: '#ffffff' },
            { value: 'cramps', label: 'Cramps / Joint Pain', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'perfect-mental', label: 'Perfect Mental Health', bg: '#06d6a0', color: '#ffffff' },
            { value: 'headache', label: 'Headache', bg: '#ffcdb2', color: '#5d4e6d' },
            { value: 'panic', label: 'Panic / Anxiety / Cry', bg: '#118ab2', color: '#ffffff' },
            { value: 'overthinking', label: 'Overthinking / Sad', bg: '#4f46e5', color: '#ffffff' },
            { value: 'perfect-both', label: 'Perfect Physical and Mental Health', bg: '#9d4edd', color: '#ffffff' }
        ]
    },
    'study-log': {
        title: '📚 Study Log',
        subtitle: 'Click each day to log what you studied.',
        options: [
            { value: 'coding', label: 'Coding', bg: '#3b82f6', color: '#ffffff' },
            { value: 'banking', label: 'Banking Prep', bg: '#10b981', color: '#ffffff' },
            { value: 'college', label: 'College Study', bg: '#f97316', color: '#ffffff' },
            { value: 'coding-banking', label: 'Coding + Banking', bg: '#7c3aed', color: '#ffffff' },
            { value: 'coding-college', label: 'Coding + College', bg: '#ec4899', color: '#ffffff' },
            { value: 'banking-college', label: 'Banking + College', bg: '#06b6d4', color: '#ffffff' },
            { value: 'all', label: 'All', bg: '#f59e0b', color: '#ffffff' },
            { value: 'none', label: 'None', bg: '#64748b', color: '#ffffff' }
        ]
    },
    'sleep-log': {
        title: '🌙 Sleep Log',
        subtitle: 'Click each day to log your sleep.',
        options: [
            { value: 'perfect-5-6', label: 'Perfect 5.5-6 hr', bg: '#118ab2', color: '#ffffff' },
            { value: 'less-6', label: 'Less than 6 hr', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'more-6', label: 'More than 6 hr', bg: '#ef476f', color: '#ffffff' },
            { value: 'more-8', label: 'More than 8 hr', bg: '#ff9f68', color: '#ffffff' },
            { value: 'perfect-time', label: 'Perfect at perfect time', bg: '#e85d75', color: '#ffffff' }
        ]
    },
    'novel-reading': {
        title: '📖 Novel Reading',
        subtitle: 'Click each day to log your reading.',
        options: [
            { value: 'self-help', label: 'Self Help Book', bg: '#118ab2', color: '#ffffff' },
            { value: 'fiction', label: 'Fiction Novel', bg: '#e85d75', color: '#ffffff' },
            { value: 'both', label: 'Both', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'none', label: 'None', bg: '#64748b', color: '#ffffff' }
        ]
    },
    'self-care': {
        title: '🛁 Self Care',
        subtitle: 'Click each day to log your self care routine.',
        options: [
            { value: 'skin', label: 'Skin Care', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'body', label: 'Body Care', bg: '#06d6a0', color: '#ffffff' },
            { value: 'hair', label: 'Hair Care', bg: '#343a40', color: '#ffffff' },
            { value: 'all', label: 'All', bg: '#ff9f68', color: '#ffffff' },
            { value: 'none', label: 'None', bg: '#ffcdb2', color: '#5d4e6d' }
        ]
    },
    'physical-mental-care': {
        title: '💪 Physical & Mental Care',
        subtitle: 'Click each day to log your care routine.',
        options: [
            { value: 'exercise', label: 'Exercise / Walk', bg: '#ff9f68', color: '#ffffff' },
            { value: 'meditation', label: 'Meditation', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'meals', label: '3 Meals', bg: '#06d6a0', color: '#ffffff' },
            { value: 'all', label: 'All', bg: '#2d6a4f', color: '#ffffff' },
            { value: 'exercise-meals', label: 'Only Exercise + Meals', bg: '#a7c957', color: '#5d4e6d' }
        ]
    }
};

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function getStorageKey(type, year) {
    return `myjournal_${type}_${year}`;
}

async function loadData(type, year) {
    const key = getStorageKey(type, year);
    try {
        const response = await fetch(`/api/data/${key}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log('Backend not available, falling back to localStorage');
    }
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error('Error loading data', e);
        return {};
    }
}

async function saveData(type, year, data) {
    const key = getStorageKey(type, year);
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage', e);
    }
    try {
        const response = await fetch(`/api/data/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (e) {
        console.log('Backend not available, saved to localStorage only');
        return false;
    }
}

function populateYearSelect(selectId, startOffset = 5, endOffset = 5) {
    const select = document.getElementById(selectId);
    if (!select) return null;
    const currentYear = new Date().getFullYear();
    select.innerHTML = '';
    for (let y = currentYear - startOffset; y <= currentYear + endOffset; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if (y === currentYear) option.selected = true;
        select.appendChild(option);
    }
    return select;
}

function flashStatus(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.opacity = '1';
    setTimeout(() => {
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '0';
    }, 1400);
}

/* ---------- Tracker page ---------- */
function initTrackerPage() {
    const type = getParam('type');
    const config = TRACKER_CONFIG[type];
    const options = config?.options || null;
    const isRateMyDay = type === 'rate-my-day';

    if (!config) {
        document.getElementById('tracker-title').textContent = 'Tracker';
        document.getElementById('tracker-subtitle').textContent = 'Unknown tracker type.';
        return;
    }

    document.getElementById('tracker-title').textContent = config.title;
    document.getElementById('tracker-subtitle').textContent = config.subtitle;
    document.title = `${config.title.replace(/^[^\s]+\s/, '')} | My Journal`;

    const yearSelect = populateYearSelect('year-select');
    const grid = document.getElementById('calendar-grid');
    const legend = document.getElementById('rating-legend');

    if (options && legend) {
        legend.style.display = 'flex';
        legend.innerHTML = '';
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            const swatch = document.createElement('span');
            swatch.className = 'legend-swatch';
            swatch.style.background = opt.bg;
            const label = document.createElement('span');
            label.textContent = opt.label;
            item.appendChild(swatch);
            item.appendChild(label);
            legend.appendChild(item);
        });
    } else if (legend) {
        legend.style.display = 'none';
    }

    let currentData = {};

    function getOption(value) {
        return options ? options.find(o => o.value == value) : null;
    }

    async function render() {
        const year = parseInt(yearSelect.value, 10);
        currentData = await loadData(type, year);
        grid.innerHTML = '';

        let markedCount = 0;
        let ratingSum = 0;
        let totalDays = 0;

        for (let month = 0; month < 12; month++) {
            const monthCard = document.createElement('div');
            monthCard.className = 'month-card';

            const title = document.createElement('div');
            title.className = 'month-title';
            title.textContent = MONTH_NAMES[month];
            monthCard.appendChild(title);

            const weekdays = document.createElement('div');
            weekdays.className = 'weekdays';
            WEEKDAY_SHORT.forEach(d => {
                const span = document.createElement('span');
                span.textContent = d;
                weekdays.appendChild(span);
            });
            monthCard.appendChild(weekdays);

            const daysGrid = document.createElement('div');
            daysGrid.className = 'days-grid';

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'day-cell empty';
                daysGrid.appendChild(empty);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                totalDays++;

                const value = currentData[dateKey];
                const option = getOption(value);
                if (option) {
                    markedCount++;
                    if (isRateMyDay) ratingSum += Number(value);
                }

                const cell = document.createElement('div');
                cell.className = 'day-cell';

                if (options) {
                    const btn = document.createElement('button');
                    btn.className = 'rating-btn';
                    btn.type = 'button';
                    btn.dataset.date = dateKey;
                    btn.title = `${dateKey} — click to mark`;
                    applyOptionStyle(btn, value);

                    const number = document.createElement('span');
                    number.className = 'rating-day-number';
                    number.textContent = day;
                    btn.appendChild(number);

                    btn.addEventListener('click', () => {
                        const currentValue = currentData[dateKey];
                        const currentIdx = options.findIndex(o => o.value == currentValue);
                        const nextIdx = currentIdx >= options.length - 1 ? -1 : currentIdx + 1;
                        currentData[dateKey] = nextIdx >= 0 ? options[nextIdx].value : null;
                        applyOptionStyle(btn, currentData[dateKey]);
                        updateStats();
                        autoSave();
                    });

                    cell.appendChild(btn);
                } else {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.dataset.date = dateKey;
                    checkbox.checked = !!currentData[dateKey];
                    checkbox.title = dateKey;
                    checkbox.addEventListener('change', () => {
                        currentData[dateKey] = checkbox.checked;
                        updateStats();
                        autoSave();
                    });

                    const number = document.createElement('span');
                    number.className = 'day-number';
                    number.textContent = day;

                    cell.appendChild(checkbox);
                    cell.appendChild(number);
                }

                daysGrid.appendChild(cell);
            }

            monthCard.appendChild(daysGrid);
            grid.appendChild(monthCard);
        }

        updateStats(markedCount, ratingSum, totalDays);
    }

    function applyOptionStyle(btn, value) {
        btn.className = 'rating-btn';
        const option = getOption(value);
        const number = btn.querySelector('.rating-day-number');
        if (option) {
            btn.style.background = option.bg;
            btn.style.borderColor = option.bg;
            btn.style.color = option.color;
            btn.setAttribute('aria-label', option.label);
            if (number) number.style.color = option.color;
        } else {
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.setAttribute('aria-label', 'not set');
            if (number) number.style.color = '';
        }
    }

    function updateStats(marked = null, sum = null, total = null) {
        const countEl = document.getElementById('completion-count');
        if (!countEl) return;

        if (options) {
            if (marked === null) {
                marked = Object.values(currentData).filter(v => getOption(v)).length;
            }
            if (isRateMyDay) {
                if (sum === null) {
                    const ratings = Object.values(currentData).filter(v => getOption(v)).map(Number);
                    sum = ratings.reduce((a, b) => a + b, 0);
                }
                const avg = marked > 0 ? (sum / marked).toFixed(1) : '0.0';
                countEl.textContent = `⭐ ${marked} rated · avg ${avg}`;
            } else {
                countEl.textContent = `🎨 ${marked} days marked`;
            }
        } else {
            if (marked === null) {
                marked = Object.values(currentData).filter(Boolean).length;
            }
            if (total === null) {
                const year = parseInt(yearSelect.value, 10);
                total = isLeap(year) ? 366 : 365;
            }
            countEl.textContent = `${marked} / ${total}`;
        }
    }

    async function autoSave() {
        const year = parseInt(yearSelect.value, 10);
        const cleaned = {};
        for (const [key, value] of Object.entries(currentData)) {
            if (value !== null && value !== false && value !== '') {
                cleaned[key] = value;
            }
        }
        const ok = await saveData(type, year, cleaned);
        if (ok) flashStatus('save-status', '✨ Saved automatically');
    }

    yearSelect.addEventListener('change', render);
    render();
}

function isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/* ---------- Highlights page ---------- */
function initHighlightsPage() {
    const yearSelect = populateYearSelect('year-select');
    const grid = document.getElementById('highlights-grid');

    const type = 'daily-highlights';
    let currentData = {};

    async function render() {
        const year = parseInt(yearSelect.value, 10);
        currentData = await loadData(type, year);
        grid.innerHTML = '';

        let entryCount = 0;

        for (let month = 0; month < 12; month++) {
            const monthCard = document.createElement('div');
            monthCard.className = 'highlight-month';

            const title = document.createElement('div');
            title.className = 'month-title';
            title.textContent = MONTH_NAMES[month];
            monthCard.appendChild(title);

            const daysContainer = document.createElement('div');
            daysContainer.className = 'highlight-days';

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dateObj = new Date(year, month, day);
                const dow = WEEKDAY_SHORT[dateObj.getDay()];

                const item = document.createElement('div');
                item.className = 'highlight-item';

                const dateBadge = document.createElement('div');
                dateBadge.className = 'highlight-date';
                dateBadge.innerHTML = `<span class="dow">${dow}</span><span class="dom">${day}</span>`;

                const textarea = document.createElement('textarea');
                textarea.rows = 2;
                textarea.placeholder = 'What made today special?';
                textarea.dataset.date = dateKey;
                textarea.value = currentData[dateKey] || '';
                textarea.addEventListener('input', () => {
                    currentData[dateKey] = textarea.value;
                    updateStats();
                    debouncedAutoSave();
                });

                if (currentData[dateKey] && currentData[dateKey].trim()) {
                    entryCount++;
                }

                item.appendChild(dateBadge);
                item.appendChild(textarea);
                daysContainer.appendChild(item);
            }

            monthCard.appendChild(daysContainer);
            grid.appendChild(monthCard);
        }

        updateStats(entryCount);
    }

    function updateStats(count = null) {
        const countEl = document.getElementById('entries-count');
        if (!countEl) return;
        if (count === null) {
            count = Object.values(currentData).filter(v => v && v.trim()).length;
        }
        countEl.textContent = `${count} entr${count === 1 ? 'y' : 'ies'}`;
    }

    let saveTimeout = null;
    function debouncedAutoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            const year = parseInt(yearSelect.value, 10);
            const ok = await saveData(type, year, currentData);
            if (ok) flashStatus('save-status', '✨ Saved automatically');
        }, 800);
    }

    yearSelect.addEventListener('change', render);
    render();
}
