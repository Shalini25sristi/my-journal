/* ---------- Helpers ---------- */
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CURRENT_USER_KEY = 'myjournal_current_user';
const TOKEN_KEY = 'myjournal_token';
const PAGES_CACHE_KEY = 'myjournal_pages_cache_v4';

const HIGHLIGHTS_PAGE_ID = 'daily-highlights';
const MAX_PAGES = 12;
const MAX_OPTIONS = 10;

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function getStorageKey(type, year) {
    const user = getCurrentUser();
    const userPart = user ? user.replace(/[^a-zA-Z0-9@._-]/g, '_') : 'guest';
    return `myjournal_${userPart}_${type}_${year}`;
}

function getCurrentUser() {
    try {
        return localStorage.getItem(CURRENT_USER_KEY);
    } catch (e) {
        return null;
    }
}

function setCurrentUser(email) {
    try {
        if (email) {
            localStorage.setItem(CURRENT_USER_KEY, email);
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    } catch (e) {
        console.error('Error setting current user', e);
    }
}

function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        return null;
    }
}

function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch (e) {
        console.error('Error setting token', e);
    }
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function handleAuthError(response) {
    if (response && response.status === 401) {
        setCurrentUser(null);
        setToken(null);
        window.location.href = 'login.html';
        return true;
    }
    return false;
}

function logoutUser() {
    setCurrentUser(null);
    setToken(null);
    try {
        localStorage.removeItem(PAGES_CACHE_KEY);
        localStorage.removeItem('myjournal_pages_cache'); // old key cleanup
    } catch (e) {}
}

function requireAuth() {
    if (!getToken() || !getCurrentUser()) {
        window.location.href = 'register.html';
        return false;
    }
    return true;
}

function redirectIfLoggedIn() {
    if (getToken() && getCurrentUser()) {
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

/* ---------- API helpers ---------- */
async function registerUser(email, password) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (result.success) {
            setCurrentUser(result.user.email);
            setToken(result.token);
        }
        return result;
    } catch (e) {
        console.error('Register request failed', e);
        return { success: false, message: 'Unable to connect to the server. Please try again.' };
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (result.success) {
            setCurrentUser(result.user.email);
            setToken(result.token);
        }
        return result;
    } catch (e) {
        console.error('Login request failed', e);
        return { success: false, message: 'Unable to connect to the server. Please try again.' };
    }
}

async function loadPages(forceRefresh = false) {
    try {
        if (!forceRefresh) {
            const cached = localStorage.getItem(PAGES_CACHE_KEY);
            if (cached) {
                return { success: true, pages: JSON.parse(cached) };
            }
        }
    } catch (e) {}

    try {
        const response = await fetch('/api/pages', { headers: getAuthHeaders() });
        if (handleAuthError(response)) return { success: false, pages: [] };

        const result = await response.json();
        if (result.success && result.pages) {
            try {
                localStorage.setItem(PAGES_CACHE_KEY, JSON.stringify(result.pages));
            } catch (e) {}
            return result;
        }
        return { success: false, pages: [] };
    } catch (e) {
        console.error('Load pages failed', e);
        try {
            const cached = localStorage.getItem(PAGES_CACHE_KEY);
            if (cached) {
                return { success: true, pages: JSON.parse(cached), offline: true };
            }
        } catch (e2) {}
        return { success: false, pages: [] };
    }
}

function invalidatePagesCache() {
    try {
        localStorage.removeItem(PAGES_CACHE_KEY);
    } catch (e) {}
}

async function createPage(name) {
    try {
        const response = await fetch('/api/pages', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (handleAuthError(response)) return { success: false };
        const result = await response.json();
        if (result.success) invalidatePagesCache();
        return result;
    } catch (e) {
        console.error('Create page failed', e);
        return { success: false, message: 'Unable to create page.' };
    }
}

async function updatePage(pageId, name) {
    try {
        const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (handleAuthError(response)) return { success: false };
        const result = await response.json();
        if (result.success) invalidatePagesCache();
        return result;
    } catch (e) {
        console.error('Update page failed', e);
        return { success: false, message: 'Unable to update page.' };
    }
}

async function deletePage(pageId) {
    try {
        const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (handleAuthError(response)) return { success: false };
        const result = await response.json();
        if (result.success) invalidatePagesCache();
        return result;
    } catch (e) {
        console.error('Delete page failed', e);
        return { success: false, message: 'Unable to delete page.' };
    }
}

async function loadPageOptions(pageId) {
    try {
        const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}/options`, {
            headers: getAuthHeaders()
        });
        if (handleAuthError(response)) return { success: false };
        return await response.json();
    } catch (e) {
        console.error('Load options failed', e);
        return { success: false };
    }
}

async function savePageOptions(pageId, options) {
    try {
        const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}/options`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ options })
        });
        if (handleAuthError(response)) return { success: false };
        const result = await response.json();
        if (result.success) invalidatePagesCache();
        return result;
    } catch (e) {
        console.error('Save options failed', e);
        return { success: false, message: 'Unable to save options.' };
    }
}

function getApiUrl(type, year) {
    if (type === HIGHLIGHTS_PAGE_ID) {
        return `/api/highlights/${year}`;
    }
    return `/api/trackers/${encodeURIComponent(type)}/${year}`;
}

async function loadData(type, year) {
    const localKey = getStorageKey(type, year);

    try {
        const response = await fetch(getApiUrl(type, year), {
            headers: getAuthHeaders()
        });

        if (handleAuthError(response)) {
            return {};
        }

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                try {
                    localStorage.setItem(localKey, JSON.stringify(result.data));
                } catch (e) {
                    console.error('Error caching data locally', e);
                }
                return result.data;
            }
        }
    } catch (e) {
        console.log('Backend not available, falling back to localStorage');
    }

    try {
        const raw = localStorage.getItem(localKey);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error('Error loading data', e);
        return {};
    }
}

async function saveData(type, year, data) {
    const localKey = getStorageKey(type, year);

    try {
        localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage', e);
    }

    try {
        const response = await fetch(getApiUrl(type, year), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (handleAuthError(response)) {
            return false;
        }

        const result = await response.json();
        return response.ok && result.success;
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

function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'login-message ' + type;
}

/* ---------- Register page ---------- */
function initRegisterPage() {
    if (redirectIfLoggedIn()) return;

    const form = document.getElementById('register-form');
    const message = document.getElementById('register-message');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!email || !password) {
            showMessage(message, 'Please enter both email and password.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage(message, 'Password must be at least 6 characters.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(message, 'Passwords do not match.', 'error');
            return;
        }

        const result = await registerUser(email, password);
        showMessage(message, result.message, result.success ? 'success' : 'error');

        if (result.success) {
            setTimeout(() => {
                window.location.href = 'login.html?registered=1';
            }, 600);
        }
    });
}

/* ---------- Login page ---------- */
function initLoginPage() {
    if (redirectIfLoggedIn()) return;

    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    if (!form) return;

    if (getParam('registered') === '1') {
        showMessage(message, 'Account created! Please log in ✨', 'success');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage(message, 'Please enter both email and password.', 'error');
            return;
        }

        const result = await loginUser(email, password);
        showMessage(message, result.message, result.success ? 'success' : 'error');

        if (result.success) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 600);
        }
    });
}

/* ---------- Home page ---------- */
const CARD_COLORS = [
    'card-pink', 'card-peach', 'card-lemon', 'card-lavender',
    'card-mint', 'card-rose', 'card-sky', 'card-dream',
    'card-pink', 'card-peach', 'card-lemon', 'card-lavender'
];

const BUILTIN_ICONS = {
    'rate-my-day': '⭐',
    'mood': '😊',
    'health': '❤️',
    'sleep': '🌙',
    'productivity': '✅',
    'reading': '📖',
    'self-care': '🛁'
};

const KEYWORD_ICONS = [
    { keywords: ['water', 'drink', 'hydration'], icon: '💧' },
    { keywords: ['exercise', 'workout', 'gym', 'fitness', 'walk', 'run'], icon: '💪' },
    { keywords: ['sleep', 'rest', 'nap'], icon: '🌙' },
    { keywords: ['study', 'learn', 'school', 'college', 'coding', 'code'], icon: '📚' },
    { keywords: ['book', 'read', 'novel'], icon: '📖' },
    { keywords: ['food', 'meal', 'eat', 'diet', 'cook'], icon: '🍽️' },
    { keywords: ['mood', 'feel', 'emotion', 'happy', 'sad'], icon: '😊' },
    { keywords: ['money', 'finance', 'expense', 'save'], icon: '💰' },
    { keywords: ['habit', 'routine', 'task', 'todo'], icon: '✅' },
    { keywords: ['health', 'sick', 'medicine', 'pain'], icon: '❤️' },
    { keywords: ['skin', 'face'], icon: '✨' },
    { keywords: ['hair'], icon: '💇' },
    { keywords: ['travel', 'trip', 'vacation'], icon: '✈️' },
    { keywords: ['meditation', 'mindful', 'yoga'], icon: '🧘' },
    { keywords: ['music', 'song'], icon: '🎵' },
    { keywords: ['movie', 'film', 'show'], icon: '🎬' },
    { keywords: ['game', 'play'], icon: '🎮' },
    { keywords: ['art', 'draw', 'paint'], icon: '🎨' },
    { keywords: ['photo', 'picture'], icon: '📷' },
    { keywords: ['plant', 'garden'], icon: '🌱' },
    { keywords: ['pet', 'dog', 'cat'], icon: '🐾' },
    { keywords: ['clean', 'tidy'], icon: '🧹' },
    { keywords: ['shop', 'buy'], icon: '🛍️' },
    { keywords: ['work', 'job', 'career'], icon: '💼' },
    { keywords: ['weather', 'sun', 'rain'], icon: '🌤️' }
];

const FALLBACK_ICONS = ['🌸', '🍃', '🌙', '✨', '💗', '🌈', '🦋', '🍄', '🌷', '💎', '🔮', '🎈'];

function getPageIcon(page) {
    if (page.isBuiltin && BUILTIN_ICONS[page.id]) {
        return BUILTIN_ICONS[page.id];
    }

    const lowerName = page.name.toLowerCase();
    for (const mapping of KEYWORD_ICONS) {
        if (mapping.keywords.some(kw => lowerName.includes(kw))) {
            return mapping.icon;
        }
    }

    // Hash-based fallback so the same name always gets the same icon
    let hash = 0;
    for (let i = 0; i < page.name.length; i++) {
        hash = page.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_ICONS.length;
    return FALLBACK_ICONS[index];
}

function initHomePage() {
    if (!requireAuth()) return;
    setupLogoutButtons();
    showCurrentUser();
    renderHomePage();
}

async function renderHomePage() {
    const grid = document.getElementById('cards-grid');
    const editModeBar = document.getElementById('edit-mode-bar');
    const editBtn = document.getElementById('edit-pages-btn');
    const addPageBtn = document.getElementById('add-page-btn');
    const doneEditBtn = document.getElementById('done-edit-btn');
    const pagesCount = document.getElementById('pages-count');
    const pageModal = document.getElementById('page-modal');
    const pageModalTitle = document.getElementById('page-modal-title');
    const pageNameInput = document.getElementById('page-name-input');
    const pageModalMessage = document.getElementById('page-modal-message');
    const pageModalSave = document.getElementById('page-modal-save');
    const pageModalCancel = document.getElementById('page-modal-cancel');

    let isEditMode = false;
    let pages = [];
    let editingPageId = null;

    async function refreshPages() {
        const result = await loadPages(true);
        pages = result.pages || [];
        renderCards();
    }

    function renderCards() {
        grid.innerHTML = '';

        pages.forEach((page, index) => {
            const card = document.createElement('a');
            card.href = `tracker.html?type=${encodeURIComponent(page.id)}`;
            card.className = `journal-card ${CARD_COLORS[index % CARD_COLORS.length]}`;

            const icon = document.createElement('span');
            icon.className = 'card-icon';
            icon.textContent = getPageIcon(page);

            const title = document.createElement('h2');
            title.textContent = page.name;

            const desc = document.createElement('p');
            desc.textContent = `${page.options.length} option${page.options.length === 1 ? '' : 's'} · click to track`;

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(desc);

            if (isEditMode) {
                card.href = '#';
                card.classList.add('edit-card');

                const actions = document.createElement('div');
                actions.className = 'card-actions';

                const editNameBtn = document.createElement('button');
                editNameBtn.type = 'button';
                editNameBtn.className = 'card-action-btn edit-name-btn';
                editNameBtn.textContent = '✏️';
                editNameBtn.title = 'Rename';
                editNameBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openPageModal(page);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'card-action-btn delete-btn';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete';
                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (confirm(`Delete "${page.name}"? This will also remove all its tracked data.`)) {
                        const result = await deletePage(page.id);
                        if (result.success) {
                            await refreshPages();
                        } else {
                            alert(result.message || 'Failed to delete page.');
                        }
                    }
                });

                actions.appendChild(editNameBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(actions);
            }

            grid.appendChild(card);
        });

        const highlightsCard = document.createElement('a');
        highlightsCard.href = 'daily-highlights.html';
        highlightsCard.className = 'journal-card card-dream';
        highlightsCard.innerHTML = `
            <span class="card-icon">🌈</span>
            <h2>Daily Highlights</h2>
            <p>Jot down a few lines for every single date.</p>
        `;
        grid.appendChild(highlightsCard);

        if (pagesCount) {
            pagesCount.textContent = `${pages.length} / ${MAX_PAGES} pages`;
        }
        if (addPageBtn) {
            addPageBtn.disabled = pages.length >= MAX_PAGES;
            addPageBtn.title = pages.length >= MAX_PAGES ? 'Maximum 12 pages reached' : 'Create a new page';
        }
    }

    function openPageModal(page = null) {
        editingPageId = page ? page.id : null;
        pageModalTitle.textContent = page ? 'Rename Page' : 'Create New Page';
        pageNameInput.value = page ? page.name : '';
        pageModalMessage.textContent = '';
        pageModal.style.display = 'flex';
        pageNameInput.focus();
    }

    function closePageModal() {
        pageModal.style.display = 'none';
        editingPageId = null;
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            isEditMode = !isEditMode;
            editBtn.textContent = isEditMode ? '✅ Done' : '✏️ Edit Pages';
            editModeBar.style.display = isEditMode ? 'flex' : 'none';
            renderCards();
        });
    }

    if (doneEditBtn) {
        doneEditBtn.addEventListener('click', () => {
            isEditMode = false;
            editBtn.textContent = '✏️ Edit Pages';
            editModeBar.style.display = 'none';
            renderCards();
        });
    }

    if (addPageBtn) {
        addPageBtn.addEventListener('click', () => {
            if (pages.length >= MAX_PAGES) return;
            openPageModal();
        });
    }

    if (pageModalSave) {
        pageModalSave.addEventListener('click', async () => {
            const name = pageNameInput.value.trim();
            if (!name) {
                showMessage(pageModalMessage, 'Please enter a page name.', 'error');
                return;
            }

            let result;
            if (editingPageId) {
                result = await updatePage(editingPageId, name);
            } else {
                result = await createPage(name);
            }

            if (result.success) {
                closePageModal();
                await refreshPages();
            } else {
                showMessage(pageModalMessage, result.message || 'Failed to save page.', 'error');
            }
        });
    }

    if (pageModalCancel) {
        pageModalCancel.addEventListener('click', closePageModal);
    }

    pageModal.querySelector('.modal-backdrop').addEventListener('click', closePageModal);
    pageNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pageModalSave.click();
        if (e.key === 'Escape') closePageModal();
    });

    await refreshPages();
}

/* ---------- Tracker page ---------- */
async function initTrackerPage() {
    if (!requireAuth()) return;

    const pageId = getParam('type');
    if (!pageId) {
        document.getElementById('tracker-title').textContent = 'Tracker';
        document.getElementById('tracker-subtitle').textContent = 'No page selected.';
        return;
    }

    const pagesResult = await loadPages(true);
    const pages = pagesResult.pages || [];
    const pageIndex = pages.findIndex(p => p.id === pageId);
    const page = pages[pageIndex];

    if (!page) {
        document.getElementById('tracker-title').textContent = 'Tracker';
        document.getElementById('tracker-subtitle').textContent = 'Page not found.';
        return;
    }

    const options = page.options || [];
    const isRateMyDay = page.id === 'rate-my-day';

    document.getElementById('tracker-title').textContent = page.name;
    document.getElementById('tracker-subtitle').textContent = options.length
        ? 'Click each day to mark it.'
        : 'This page has no options yet. Click "Edit Options" to add some.';
    document.title = `${page.name.replace(/^[^\s]+\s/, '')} | My Journal`;

    setupTrackerNavigation(pageId, pages, pageIndex);
    setupOptionsEditor(page);

    const yearSelect = populateYearSelect('year-select');
    const grid = document.getElementById('calendar-grid');
    const legend = document.getElementById('rating-legend');

    if (options.length && legend) {
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
        return options.find(o => String(o.value) === String(value));
    }

    async function render() {
        const year = parseInt(yearSelect.value, 10);
        currentData = await loadData(pageId, year);
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

                if (options.length) {
                    const btn = document.createElement('button');
                    btn.className = 'rating-btn';
                    btn.type = 'button';
                    btn.dataset.date = dateKey;
                    btn.title = `${dateKey} — click to mark`;
                    applyOptionStyle(btn, value, options);

                    const number = document.createElement('span');
                    number.className = 'rating-day-number';
                    number.textContent = day;
                    btn.appendChild(number);

                    btn.addEventListener('click', () => {
                        const currentValue = currentData[dateKey];
                        const currentIdx = options.findIndex(o => String(o.value) === String(currentValue));
                        const nextIdx = currentIdx >= options.length - 1 ? -1 : currentIdx + 1;
                        currentData[dateKey] = nextIdx >= 0 ? options[nextIdx].value : null;
                        applyOptionStyle(btn, currentData[dateKey], options);
                        updateStats();
                        autoSave();
                    });

                    cell.appendChild(btn);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.className = 'day-cell no-options';
                    emptyCell.textContent = day;
                    cell.appendChild(emptyCell);
                }

                daysGrid.appendChild(cell);
            }

            monthCard.appendChild(daysGrid);
            grid.appendChild(monthCard);
        }

        updateStats(markedCount, ratingSum, totalDays);
    }

    function updateStats(marked = null, sum = null, total = null) {
        const countEl = document.getElementById('completion-count');
        if (!countEl) return;

        if (options.length) {
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
            countEl.textContent = 'No options configured';
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
        const ok = await saveData(pageId, year, cleaned);
        if (ok) flashStatus('save-status', '✨ Saved automatically');
    }

    yearSelect.addEventListener('change', render);
    render();
}

function applyOptionStyle(btn, value, options) {
    btn.className = 'rating-btn';
    const option = options.find(o => String(o.value) === String(value));
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

function setupTrackerNavigation(currentPageId, pages, currentIndex) {
    const prevBtn = document.getElementById('prev-tracker');
    const nextBtn = document.getElementById('next-tracker');
    if (!prevBtn || !nextBtn) return;

    const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
    const nextPage = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
    const isLastTracker = currentIndex === pages.length - 1;

    if (prevPage) {
        prevBtn.href = `tracker.html?type=${encodeURIComponent(prevPage.id)}`;
        prevBtn.textContent = `← ${prevPage.name}`;
        prevBtn.style.display = 'inline-flex';
    } else {
        prevBtn.style.display = 'none';
    }

    if (nextPage) {
        nextBtn.href = `tracker.html?type=${encodeURIComponent(nextPage.id)}`;
        nextBtn.textContent = `${nextPage.name} →`;
        nextBtn.style.display = 'inline-flex';
    } else if (isLastTracker) {
        nextBtn.href = 'daily-highlights.html';
        nextBtn.textContent = '🌈 Daily Highlights →';
        nextBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'none';
    }
}

function setupOptionsEditor(page) {
    const editBtn = document.getElementById('edit-options-btn');
    const modal = document.getElementById('options-modal');
    const editor = document.getElementById('options-editor');
    const addOptionBtn = document.getElementById('add-option-btn');
    const saveBtn = document.getElementById('options-modal-save');
    const cancelBtn = document.getElementById('options-modal-cancel');
    const message = document.getElementById('options-modal-message');

    if (!editBtn || !modal) return;

    let currentOptions = [];

    function renderOptionRows() {
        editor.innerHTML = '';
        currentOptions.forEach((opt, index) => {
            const row = document.createElement('div');
            row.className = 'option-row';

            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.placeholder = 'Label';
            labelInput.value = opt.label;
            labelInput.className = 'option-label-input';
            labelInput.addEventListener('input', () => {
                currentOptions[index].label = labelInput.value;
            });

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.placeholder = 'Value';
            valueInput.value = opt.value;
            valueInput.className = 'option-value-input';
            valueInput.addEventListener('input', () => {
                currentOptions[index].value = valueInput.value;
            });

            const bgInput = document.createElement('input');
            bgInput.type = 'color';
            bgInput.value = opt.bg;
            bgInput.className = 'option-color-input';
            bgInput.title = 'Background color';
            bgInput.addEventListener('input', () => {
                currentOptions[index].bg = bgInput.value;
            });

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = opt.color;
            colorInput.className = 'option-color-input';
            colorInput.title = 'Text color';
            colorInput.addEventListener('input', () => {
                currentOptions[index].color = colorInput.value;
            });

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'option-remove-btn';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Remove option';
            removeBtn.addEventListener('click', () => {
                currentOptions.splice(index, 1);
                renderOptionRows();
            });

            row.appendChild(labelInput);
            row.appendChild(valueInput);
            row.appendChild(bgInput);
            row.appendChild(colorInput);
            row.appendChild(removeBtn);
            editor.appendChild(row);
        });

        if (addOptionBtn) {
            addOptionBtn.disabled = currentOptions.length >= MAX_OPTIONS;
            addOptionBtn.textContent = currentOptions.length >= MAX_OPTIONS
                ? 'Max 10 options reached'
                : '+ Add Option';
        }
    }

    function openModal() {
        currentOptions = (page.options || []).map(o => ({ ...o }));
        message.textContent = '';
        renderOptionRows();
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    editBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    addOptionBtn.addEventListener('click', () => {
        if (currentOptions.length >= MAX_OPTIONS) return;
        currentOptions.push({
            value: `option-${currentOptions.length + 1}`,
            label: '',
            bg: '#b197fc',
            color: '#ffffff'
        });
        renderOptionRows();
    });

    saveBtn.addEventListener('click', async () => {
        const validOptions = currentOptions.filter(o => o.label.trim() && o.value.trim());
        if (validOptions.length === 0) {
            showMessage(message, 'Please add at least one option with a label and value.', 'error');
            return;
        }
        if (validOptions.length > MAX_OPTIONS) {
            showMessage(message, `Maximum ${MAX_OPTIONS} options allowed.`, 'error');
            return;
        }

        const result = await savePageOptions(page.id, validOptions);
        if (result.success) {
            closeModal();
            await loadPages(true);
            window.location.reload();
        } else {
            showMessage(message, result.message || 'Failed to save options.', 'error');
        }
    });
}

function isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/* ---------- Highlights page ---------- */
function initHighlightsPage() {
    if (!requireAuth()) return;

    const yearSelect = populateYearSelect('year-select');
    const grid = document.getElementById('highlights-grid');

    const type = HIGHLIGHTS_PAGE_ID;
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
            const cleaned = {};
            for (const [key, value] of Object.entries(currentData)) {
                if (value && value.trim()) {
                    cleaned[key] = value;
                }
            }
            const ok = await saveData(type, year, cleaned);
            if (ok) flashStatus('save-status', '✨ Saved automatically');
        }, 800);
    }

    yearSelect.addEventListener('change', render);
    render();
}

/* ---------- Shared UI helpers ---------- */
function setupLogoutButtons() {
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.href = 'login.html';
        });
    });
}

function showCurrentUser() {
    const el = document.getElementById('current-user');
    if (el) {
        const user = getCurrentUser();
        el.textContent = user ? `logged in as ${user}` : '';
    }
}
