/* ---------- Helpers ---------- */
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CURRENT_USER_KEY = 'myjournal_current_user';
const TOKEN_KEY = 'myjournal_token';
const PAGES_CACHE_KEY = 'myjournal_pages_cache_v4';
const THEME_KEY = 'myjournal_theme';
const THEME_MODE_KEY = 'myjournal_theme_mode';

const HIGHLIGHTS_PAGE_ID = 'daily-highlights';
const MAX_PAGES = 12;
const MAX_OPTIONS = 10;

const THEMES = [
    {
        id: 'candy-dreams',
        name: 'Candy Dreams',
        preview: 'linear-gradient(135deg, #ffc8dd 0%, #e0c3fc 50%, #a0c4ff 100%)',
        decorations: [
            { class: 'cloud cloud-1', emoji: '☁️' },
            { class: 'cloud cloud-2', emoji: '☁️' },
            { class: 'cloud cloud-3', emoji: '🍬' },
            { class: 'sun sun-2', emoji: '🌞' },
            { class: 'sun sun-3', emoji: '🍭' },
            { class: 'star star-1', emoji: '✨' },
            { class: 'star star-2', emoji: '🌟' },
            { class: 'star star-4', emoji: '🍩' },
            { class: 'heart heart-1', emoji: '💗' },
            { class: 'heart heart-2', emoji: '💖' },
            { class: 'heart heart-4', emoji: '🧁' }
        ]
    },
    {
        id: 'ocean-breeze',
        name: 'Ocean Breeze',
        preview: 'linear-gradient(135deg, #e8f4ff 0%, #d4f1f4 50%, #b8e1ff 100%)',
        decorations: [
            { class: 'cloud cloud-1', emoji: '🌊' },
            { class: 'cloud cloud-2', emoji: '🐚' },
            { class: 'cloud cloud-4', emoji: '🐋' },
            { class: 'sun sun-2', emoji: '🐟' },
            { class: 'sun sun-3', emoji: '⭐' },
            { class: 'star star-1', emoji: '🐠' },
            { class: 'star star-2', emoji: '🦈' },
            { class: 'star star-5', emoji: '🦀' },
            { class: 'heart heart-1', emoji: '🐙' },
            { class: 'heart heart-2', emoji: '🐡' },
            { class: 'heart heart-4', emoji: '🦑' }
        ]
    },
    {
        id: 'forest-walk',
        name: 'Forest Walk',
        preview: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 50%, #dcedc8 100%)',
        decorations: [
            { class: 'cloud cloud-1', emoji: '🌲' },
            { class: 'cloud cloud-2', emoji: '🍃' },
            { class: 'cloud cloud-3', emoji: '🌳' },
            { class: 'sun sun-2', emoji: '🍄' },
            { class: 'sun sun-3', emoji: '🌰' },
            { class: 'star star-1', emoji: '🦌' },
            { class: 'star star-2', emoji: '🦋' },
            { class: 'star star-4', emoji: '🐿️' },
            { class: 'heart heart-1', emoji: '🌿' },
            { class: 'heart heart-2', emoji: '🌷' },
            { class: 'heart heart-4', emoji: '🍁' }
        ]
    },
    {
        id: 'sunset-glow',
        name: 'Sunset Glow',
        preview: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffccbc 100%)',
        decorations: [
            { class: 'cloud cloud-1', emoji: '🌅' },
            { class: 'cloud cloud-2', emoji: '🌇' },
            { class: 'cloud cloud-3', emoji: '☁️' },
            { class: 'sun sun-2', emoji: '🌻' },
            { class: 'sun sun-3', emoji: '🌞' },
            { class: 'star star-1', emoji: '🦩' },
            { class: 'star star-2', emoji: '🍊' },
            { class: 'star star-5', emoji: '🌾' },
            { class: 'heart heart-1', emoji: '🌋' },
            { class: 'heart heart-2', emoji: '🍑' },
            { class: 'heart heart-4', emoji: '🦋' }
        ]
    },
    {
        id: 'midnight-edge',
        name: 'Midnight Edge',
        preview: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 50%, #b0bec5 100%)',
        decorations: [
            { class: 'cloud cloud-1 shape-ring' },
            { class: 'cloud cloud-2 shape-square' },
            { class: 'cloud cloud-3 shape-hexagon' },
            { class: 'sun sun-2 shape-dot' },
            { class: 'sun sun-3 shape-pulse' },
            { class: 'moon moon-1 shape-crescent' },
            { class: 'star star-1 shape-line' },
            { class: 'star star-2 shape-triangle' },
            { class: 'star star-4 shape-zigzag' },
            { class: 'heart heart-1 shape-plus' },
            { class: 'heart heart-2 shape-diamond' },
            { class: 'heart heart-4 shape-bar' }
        ]
    },
    {
        id: 'harmony',
        name: 'Harmony',
        preview: 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 50%, #fce4ec 100%)',
        decorations: [
            { class: 'cloud cloud-1', emoji: '🌸' },
            { class: 'cloud cloud-2', emoji: '🍃' },
            { class: 'cloud cloud-4', emoji: '🕊️' },
            { class: 'sun sun-2', emoji: '🌙' },
            { class: 'sun sun-3', emoji: '☀️' },
            { class: 'star star-1', emoji: '🌈' },
            { class: 'star star-2', emoji: '💎' },
            { class: 'star star-5', emoji: '✨' },
            { class: 'heart heart-1', emoji: '⚖️' },
            { class: 'heart heart-2', emoji: '🤝' },
            { class: 'heart heart-4', emoji: '🌍' }
        ]
    }
];

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
async function registerUser(username, email, password, confirmPassword) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        const result = await response.json();
        if (result.success) {
            setCurrentUser(result.user.username);
            setToken(result.token);
        }
        return result;
    } catch (e) {
        console.error('Register request failed', e);
        return { success: false, message: 'Unable to connect to the server. Please try again.' };
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            setCurrentUser(result.user.username);
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

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateCurrentStreak(data) {
    const today = new Date();
    let currentValue = null;
    let startOffset = 0;

    // Find the most recent non-empty value
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = getDateKey(d);
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            currentValue = data[key];
            startOffset = i;
            break;
        }
    }

    if (currentValue === null) return { streak: 0, value: null };

    let streak = 1;
    for (let i = startOffset + 1; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = getDateKey(d);
        if (data[key] === currentValue) {
            streak++;
        } else {
            break;
        }
    }

    return { streak, value: currentValue };
}

function calculateLongestStreak(data, value) {
    let longest = 0;
    let current = 0;
    const today = new Date();

    for (let i = 0; i < 365 * 2; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = getDateKey(d);
        if (data[key] === value) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 0;
        }
    }

    return longest;
}

function calculateAnyStreak(data) {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = getDateKey(d);
        const value = data[key];
        if (value !== undefined && value !== null && value.toString().trim() !== '') {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function formatStreak(streak, label = 'day') {
    if (streak === 0) return '';
    const plural = streak === 1 ? label : `${label}s`;
    return `🔥 ${streak} ${plural}`;
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
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!username || !email || !password || !confirmPassword) {
            showMessage(message, 'Please fill in all fields.', 'error');
            return;
        }

        if (username.length < 3) {
            showMessage(message, 'Username must be at least 3 characters.', 'error');
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

        const result = await registerUser(username, email, password, confirmPassword);
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
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showMessage(message, 'Please enter both username and password.', 'error');
            return;
        }

        const result = await loginUser(username, password);
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

    let isEditMode = new URLSearchParams(window.location.search).get('edit') === '1';
    let pages = [];
    let editingPageId = null;

    if (isEditMode && editBtn) {
        editBtn.textContent = '✅ Done';
        editModeBar.style.display = 'flex';
    }

    async function refreshPages() {
        const result = await loadPages(true);
        pages = result.pages || [];
        renderCards();
        await renderCardStreaks();
    }

    function renderCards() {
        grid.innerHTML = '';

        pages.forEach((page, index) => {
            const options = page.options || [];
            const card = document.createElement('a');
            card.href = `tracker.html?type=${encodeURIComponent(page.id)}`;
            card.className = `journal-card ${CARD_COLORS[index % CARD_COLORS.length]}`;

            const icon = document.createElement('span');
            icon.className = 'card-icon';
            icon.textContent = getPageIcon(page);

            const title = document.createElement('h2');
            title.textContent = page.name;

            const desc = document.createElement('p');
            desc.textContent = `${options.length} option${options.length === 1 ? '' : 's'} · click to track`;

            const streak = document.createElement('span');
            streak.className = 'card-streak';
            streak.dataset.pageId = page.id;
            streak.textContent = '';

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(streak);

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

        if (pages.length === 0 && !isEditMode) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No tracker pages yet.</p>
                <p>Click <strong>✏️ Edit Pages</strong> to create your first page.</p>
            `;
            grid.appendChild(emptyState);
        }

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

async function renderCardStreaks() {
    const year = new Date().getFullYear();
    const streakEls = document.querySelectorAll('.card-streak');
    if (streakEls.length === 0) return;

    for (const el of streakEls) {
        const pageId = el.dataset.pageId;
        if (!pageId) continue;
        const data = await loadData(pageId, year);
        const { streak } = calculateCurrentStreak(data);
        if (streak > 0) {
            el.textContent = `🔥 ${streak}`;
        }
    }
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
    let streakData = {};

    function getOption(value) {
        return options.find(o => String(o.value) === String(value));
    }

    async function loadStreakData() {
        const currentYear = new Date().getFullYear();
        streakData = await loadData(pageId, currentYear);
    }

    async function render() {
        const year = parseInt(yearSelect.value, 10);
        currentData = await loadData(pageId, year);
        await loadStreakData();
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
        updateStreakStatus();
    }

    function updateStreakStatus() {
        const streakEl = document.getElementById('streak-status');
        if (!streakEl) return;

        const { streak, value } = calculateCurrentStreak(streakData);
        if (streak === 0) {
            streakEl.textContent = '';
            return;
        }

        const option = getOption(value);
        const label = option ? option.label : value;
        streakEl.textContent = `🔥 ${streak} day${streak === 1 ? '' : 's'} — ${label}`;
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
        await loadStreakData();
        updateStreakStatus();
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

/* ---------- Vision Board page ---------- */
function initVisionBoardPage() {
    if (!requireAuth()) return;

    const timeframeSelect = document.getElementById('timeframe-select');
    const targetSelect = document.getElementById('target-select');
    const boardTitleInput = document.getElementById('board-title');
    const saveTitleBtn = document.getElementById('save-title-btn');
    const centerTitle = document.getElementById('center-title');
    const centerPeriod = document.getElementById('center-period');
    const boardItems = document.getElementById('board-items');
    const itemCount = document.getElementById('item-count');
    const addTextBtn = document.getElementById('add-text-btn');
    const addImageBtn = document.getElementById('add-image-btn');

    const textModal = document.getElementById('text-modal');
    const textContent = document.getElementById('text-content');
    const textSave = document.getElementById('text-modal-save');
    const textCancel = document.getElementById('text-modal-cancel');
    const textMessage = document.getElementById('text-modal-message');

    const imageModal = document.getElementById('image-modal');
    const imageFile = document.getElementById('image-file');
    const imagePreview = document.getElementById('image-preview');
    const imageSave = document.getElementById('image-modal-save');
    const imageCancel = document.getElementById('image-modal-cancel');
    const imageMessage = document.getElementById('image-modal-message');

    if (!timeframeSelect) return;

    let currentBoard = null;

    function generateTargets(timeframe) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const targets = [];

        if (timeframe === 'monthly') {
            for (let i = 0; i <= 15; i++) {
                const d = new Date(year, month + i, 1);
                const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
                targets.push({ value, label });
            }
        } else if (timeframe === 'quarterly') {
            for (let i = 0; i <= 10; i++) {
                const quarterMonth = month + (i * 3);
                const d = new Date(year, quarterMonth, 1);
                const q = Math.floor(d.getMonth() / 3) + 1;
                const value = `${d.getFullYear()}-Q${q}`;
                const label = `Q${q} ${d.getFullYear()}`;
                targets.push({ value, label });
            }
        } else if (timeframe === 'halfyearly') {
            for (let i = 0; i <= 8; i++) {
                const halfMonth = month + (i * 6);
                const d = new Date(year, halfMonth, 1);
                const half = Math.floor(d.getMonth() / 6) + 1;
                const value = `${d.getFullYear()}-H${half}`;
                const label = `H${half} ${d.getFullYear()}`;
                targets.push({ value, label });
            }
        } else if (timeframe === 'yearly') {
            for (let i = 0; i <= 7; i++) {
                const value = String(year + i);
                targets.push({ value, label: value });
            }
        } else if (timeframe === '5year') {
            const currentStart = Math.floor(year / 5) * 5;
            for (let i = 0; i <= 4; i++) {
                const start = currentStart + (i * 5);
                const value = `${start}-${start + 4}`;
                targets.push({ value, label: value });
            }
        } else if (timeframe === '10year') {
            const currentStart = Math.floor(year / 10) * 10;
            for (let i = 0; i <= 4; i++) {
                const start = currentStart + (i * 10);
                const value = `${start}-${start + 9}`;
                targets.push({ value, label: value });
            }
        }

        return targets;
    }

    function populateTargets() {
        const timeframe = timeframeSelect.value;
        const targets = generateTargets(timeframe);
        const currentValue = targetSelect.value;
        targetSelect.innerHTML = '';

        targets.forEach(t => {
            const option = document.createElement('option');
            option.value = t.value;
            option.textContent = t.label;
            targetSelect.appendChild(option);
        });

        if (targets.some(t => t.value === currentValue)) {
            targetSelect.value = currentValue;
        }
    }

    function getTimeframeLabel(timeframe) {
        const labels = {
            monthly: 'Monthly',
            quarterly: 'Quarterly',
            halfyearly: 'Half Yearly',
            yearly: 'Yearly',
            '5year': '5 Years',
            '10year': '10 Years'
        };
        return labels[timeframe] || timeframe;
    }

    async function loadBoard() {
        const timeframe = timeframeSelect.value;
        const targetDate = targetSelect.value;

        try {
            const response = await fetch(`/api/vision-boards/${encodeURIComponent(timeframe)}/${encodeURIComponent(targetDate)}`, {
                headers: getAuthHeaders()
            });

            if (handleAuthError(response)) return;
            const result = await response.json();
            if (!result.success) return;

            currentBoard = result.board;
            boardTitleInput.value = currentBoard.title;
            centerTitle.textContent = currentBoard.title;
            centerPeriod.textContent = `${getTimeframeLabel(currentBoard.timeframe)} · ${currentBoard.targetDate}`;
            itemCount.textContent = `${result.items.length} / 80 items`;
            renderItems(result.items);
        } catch (e) {
            console.error('Load vision board failed', e);
        }
    }

    function renderItems(items) {
        boardItems.innerHTML = '';

        if (items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-board';
            empty.innerHTML = '<p>Add text and images to build your vision board ✨</p>';
            boardItems.appendChild(empty);
            return;
        }

        const isMobile = window.innerWidth < 768;
        const cols = isMobile ? 4 : 8;
        const rows = isMobile ? 24 : 12;
        const center = isMobile ? { col: 0, row: 0, colSpan: 2, rowSpan: 2 } : { col: 2, row: 1, colSpan: 4, rowSpan: 2 };
        const positions = generateGridPositions(items.length, cols, rows, center);

        items.forEach((item, index) => {
            const el = document.createElement('div');
            const pos = positions[index];
            el.className = `board-item ${item.item_type === 'text' ? 'text-item' : 'image-item'}`;
            el.style.gridColumn = `${pos.col + 1} / span ${pos.colSpan}`;
            el.style.gridRow = `${pos.row + 1} / span ${pos.rowSpan}`;

            if (item.item_type === 'text') {
                el.textContent = item.content;
            } else {
                const img = document.createElement('img');
                img.src = item.content;
                img.alt = 'Vision board image';
                el.appendChild(img);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.textContent = '✕';
            deleteBtn.type = 'button';
            deleteBtn.title = 'Remove item';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Remove this item from your vision board?')) {
                    await deleteItem(item.id);
                }
            });

            el.appendChild(deleteBtn);
            boardItems.appendChild(el);
        });
    }

    function generateGridPositions(count, cols, rows, center) {
        const positions = [];
        const occupied = new Set();

        // Mark center cells as occupied
        for (let r = center.row; r < center.row + center.rowSpan; r++) {
            for (let c = center.col; c < center.col + center.colSpan; c++) {
                occupied.add(`${r},${c}`);
            }
        }

        let row = 0;
        let col = 0;
        let direction = 1; // 1 = right, -1 = left

        while (positions.length < count && row < rows) {
            // For row-by-row snake placement
            if (direction === 1 && col >= cols) {
                row++;
                direction = -1;
                col = cols - 1;
            } else if (direction === -1 && col < 0) {
                row++;
                direction = 1;
                col = 0;
            }

            if (row >= rows) break;

            if (!occupied.has(`${row},${col}`)) {
                positions.push({ col, row, colSpan: 1, rowSpan: 1 });
            }

            col += direction;
        }

        return positions;
    }

    async function deleteItem(itemId) {
        try {
            const response = await fetch(`/api/vision-boards/items/${encodeURIComponent(itemId)}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (handleAuthError(response)) return;
            const result = await response.json();
            if (result.success) await loadBoard();
        } catch (e) {
            console.error('Delete vision board item failed', e);
        }
    }

    async function saveTitle() {
        if (!currentBoard) return;
        const title = boardTitleInput.value.trim();
        if (!title) return;

        try {
            const response = await fetch(`/api/vision-boards/${currentBoard.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title })
            });
            if (handleAuthError(response)) return;
            const result = await response.json();
            if (result.success) {
                currentBoard.title = title;
                centerTitle.textContent = title;
                flashStatus('save-status', '✨ Title saved');
            }
        } catch (e) {
            console.error('Save title failed', e);
        }
    }

    async function addText() {
        const content = textContent.value.trim();
        if (!content) {
            showMessage(textMessage, 'Please enter some text.', 'error');
            return;
        }
        await addItem('text', content);
        closeTextModal();
    }

    async function addImage() {
        const file = imageFile.files[0];
        if (!file) {
            showMessage(imageMessage, 'Please select an image.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(imageMessage, 'Image must be smaller than 5MB.', 'error');
            return;
        }

        imageSave.disabled = true;
        imageSave.textContent = 'Adding...';

        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = await addItem('image', e.target.result);
            imageSave.disabled = false;
            imageSave.textContent = 'Add';
            if (result) closeImageModal();
        };
        reader.onerror = () => {
            imageSave.disabled = false;
            imageSave.textContent = 'Add';
            showMessage(imageMessage, 'Failed to read image. Please try again.', 'error');
        };
        reader.readAsDataURL(file);
    }

    async function addItem(itemType, content) {
        if (!currentBoard) return false;
        try {
            const response = await fetch(`/api/vision-boards/${currentBoard.id}/items`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ itemType, content })
            });
            if (handleAuthError(response)) return false;
            const result = await response.json();
            if (result.success) {
                await loadBoard();
                return true;
            } else {
                if (itemType === 'text') showMessage(textMessage, result.message || 'Failed to add.', 'error');
                else showMessage(imageMessage, result.message || 'Failed to add.', 'error');
                return false;
            }
        } catch (err) {
            console.error('Add item failed', err);
            if (itemType === 'text') showMessage(textMessage, 'Unable to connect. Please try again.', 'error');
            else showMessage(imageMessage, 'Unable to connect. Please try again.', 'error');
            return false;
        }
    }

    function openTextModal() {
        textContent.value = '';
        textMessage.textContent = '';
        textModal.style.display = 'flex';
        textContent.focus();
    }

    function closeTextModal() {
        textModal.style.display = 'none';
    }

    function openImageModal() {
        imageFile.value = '';
        imageMessage.textContent = '';
        imageModal.style.display = 'flex';
    }

    function closeImageModal() {
        imageModal.style.display = 'none';
    }

    // Event listeners
    timeframeSelect.addEventListener('change', () => {
        populateTargets();
        setDefaultTarget();
        loadBoard();
    });
    targetSelect.addEventListener('change', loadBoard);
    saveTitleBtn.addEventListener('click', saveTitle);
    boardTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveTitle();
    });

    addTextBtn.addEventListener('click', openTextModal);
    textSave.addEventListener('click', addText);
    textCancel.addEventListener('click', closeTextModal);
    textModal.querySelector('.modal-backdrop').addEventListener('click', closeTextModal);
    textContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addText();
        }
    });

    addImageBtn.addEventListener('click', openImageModal);
    imageSave.addEventListener('click', addImage);
    imageCancel.addEventListener('click', closeImageModal);
    imageModal.querySelector('.modal-backdrop').addEventListener('click', closeImageModal);
    imageFile.addEventListener('change', () => {
        const file = imageFile.files[0];
        imagePreview.innerHTML = '';
        imageMessage.textContent = '';
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showMessage(imageMessage, 'Image must be smaller than 5MB.', 'error');
            imageFile.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    populateTargets();
    loadBoard();
}

/* ---------- Analysis page ---------- */
function initAnalysisPage() {
    if (!requireAuth()) return;

    const scopeSelect = document.getElementById('scope-select');
    const pageSelect = document.getElementById('page-select');
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const weekSelect = document.getElementById('week-select');
    const weekControl = document.getElementById('week-control');
    const yearControl = document.getElementById('year-control');
    const monthControl = document.getElementById('month-control');
    const loadingEl = document.getElementById('analysis-loading');
    const resultsEl = document.getElementById('analysis-results');
    const pageComparisonSection = document.getElementById('page-comparison-section');

    if (!scopeSelect) return;

    let pages = [];
    let allData = {};

    function formatPageDisplayName(page) {
        const icon = getPageIcon(page);
        let name = page.name.trim();
        if (name.startsWith(icon)) {
            name = name.substring(icon.length).trim();
        }
        const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        return `${icon} ${formatted}`;
    }

    async function init() {
        const result = await loadPages(true);
        pages = result.pages || [];

        populateTargets();
        setDefaultTarget();

        loadBoard();
    }

    function setDefaultTarget() {
        const now = new Date();
        const timeframe = timeframeSelect.value;
        let defaultValue;

        if (timeframe === 'monthly') {
            defaultValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeframe === 'quarterly') {
            const q = Math.floor(now.getMonth() / 3) + 1;
            defaultValue = `${now.getFullYear()}-Q${q}`;
        } else if (timeframe === 'halfyearly') {
            const h = Math.floor(now.getMonth() / 6) + 1;
            defaultValue = `${now.getFullYear()}-H${h}`;
        } else if (timeframe === 'yearly') {
            defaultValue = String(now.getFullYear());
        } else if (timeframe === '5year') {
            const start = Math.floor(now.getFullYear() / 5) * 5;
            defaultValue = `${start}-${start + 4}`;
        } else if (timeframe === '10year') {
            const start = Math.floor(now.getFullYear() / 10) * 10;
            defaultValue = `${start}-${start + 9}`;
        }

        if (defaultValue && Array.from(targetSelect.options).some(o => o.value === defaultValue)) {
            targetSelect.value = defaultValue;
        }
    }

    function populateWeekSelect() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        weekSelect.innerHTML = '';

        for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(currentDate.getDate() - (weekOffset * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekEnd.getDate() - 6);

            const formatDate = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
            const option = document.createElement('option');
            option.value = getDateKey(weekStart);
            option.textContent = `${formatDate(weekStart)} – ${formatDate(weekEnd)}`;
            if (weekOffset === 0) option.selected = true;
            weekSelect.appendChild(option);
        }
    }

    function getWeekRange(weekStartKey) {
        const start = new Date(weekStartKey);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    }

    function updateControls() {
        const scope = scopeSelect.value;
        if (scope === 'overall') {
            yearControl.style.display = 'none';
            monthControl.style.display = 'none';
            weekControl.style.display = 'none';
        } else if (scope === 'yearly') {
            yearControl.style.display = 'flex';
            monthControl.style.display = 'none';
            weekControl.style.display = 'none';
        } else if (scope === 'monthly') {
            yearControl.style.display = 'flex';
            monthControl.style.display = 'flex';
            weekControl.style.display = 'none';
        } else {
            yearControl.style.display = 'none';
            monthControl.style.display = 'none';
            weekControl.style.display = 'flex';
        }
    }

    async function loadAllData() {
        const scope = scopeSelect.value;
        const selectedYear = parseInt(yearSelect.value, 10);
        const selectedPage = pageSelect.value;

        allData = {};
        let yearsToLoad;
        if (scope === 'overall') {
            yearsToLoad = getYearRange();
        } else if (scope === 'weekly') {
            const { start } = getWeekRange(weekSelect.value);
            yearsToLoad = [start.getFullYear()];
        } else {
            yearsToLoad = [selectedYear];
        }
        const pagesToLoad = selectedPage === 'all' ? pages : pages.filter(p => p.id === selectedPage);

        const promises = [];
        for (const page of pagesToLoad) {
            allData[page.id] = { page, years: {} };
            for (const year of yearsToLoad) {
                promises.push(
                    loadData(page.id, year).then(data => {
                        allData[page.id].years[year] = data;
                    })
                );
            }
        }
        await Promise.all(promises);
    }

    function getYearRange() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear - 5; y <= currentYear; y++) {
            years.push(y);
        }
        return years;
    }

    function getRelevantData() {
        const scope = scopeSelect.value;
        const selectedYear = parseInt(yearSelect.value, 10);
        const selectedMonth = parseInt(monthSelect.value, 10);
        const selectedPage = pageSelect.value;
        const { start: weekStart, end: weekEnd } = scope === 'weekly' ? getWeekRange(weekSelect.value) : { start: null, end: null };

        const relevant = [];
        const pagesToUse = selectedPage === 'all' ? pages : pages.filter(p => p.id === selectedPage);

        for (const page of pagesToUse) {
            const pageData = allData[page.id];
            if (!pageData) continue;

            const entries = [];
            for (const [year, data] of Object.entries(pageData.years)) {
                for (const [date, value] of Object.entries(data)) {
                    if (value === null || value === undefined || value === '') continue;
                    const dateObj = new Date(date);
                    const [y, m] = date.split('-').map(Number);
                    if (scope === 'weekly' && (dateObj < weekStart || dateObj > weekEnd)) continue;
                    if (scope === 'monthly' && (y !== selectedYear || m - 1 !== selectedMonth)) continue;
                    if (scope === 'yearly' && y !== selectedYear) continue;
                    entries.push({ date, value, year: y, month: m - 1, day: dateObj.getDate(), weekday: dateObj.getDay() });
                }
            }

            relevant.push({ page, entries });
        }

        return relevant;
    }

    function calculateStreaksForData(entries) {
        const data = {};
        entries.forEach(e => data[e.date] = e.value);
        const { streak } = calculateCurrentStreak(data);
        const longest = calculateLongestStreak(data);
        return { current: streak, longest };
    }

    function calculateLongestStreak(data) {
        let longest = 0;
        let current = 0;
        const today = new Date();
        for (let i = 0; i < 365 * 6; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = getDateKey(d);
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        }
        return longest;
    }

    function getOptionCounts(entries, page) {
        const counts = {};
        const options = page.options || [];
        options.forEach(opt => counts[opt.value] = { label: opt.label, value: opt.value, count: 0, color: opt.bg });

        entries.forEach(e => {
            const value = String(e.value);
            if (counts[value]) {
                counts[value].count++;
            } else {
                counts[value] = { label: value, value, count: 1, color: '#999' };
            }
        });

        return Object.values(counts).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    }

    function getMonthlyTrend(entries) {
        const months = {};
        for (let i = 0; i < 12; i++) {
            months[i] = { month: MONTH_NAMES[i], count: 0 };
        }
        entries.forEach(e => {
            months[e.month].count++;
        });
        return Object.values(months);
    }

    function getPageComparison(relevantData) {
        return relevantData.map(({ page, entries }) => {
            let name = page.name.trim();
            const icon = getPageIcon(page);
            if (name.startsWith(icon)) {
                name = name.substring(icon.length).trim();
            }
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                count: entries.length,
                icon
            };
        }).sort((a, b) => b.count - a.count);
    }

    async function runAnalysis() {
        loadingEl.style.display = 'block';
        resultsEl.style.display = 'none';

        await loadAllData();
        const relevantData = getRelevantData();

        const allEntries = relevantData.flatMap(d => d.entries);
        const totalDays = allEntries.length;

        let currentStreak = 0;
        let longestStreak = 0;
        let mostFrequent = '—';

        if (relevantData.length === 1) {
            const { page, entries } = relevantData[0];
            const streaks = calculateStreaksForData(entries);
            currentStreak = streaks.current;
            longestStreak = streaks.longest;
            const counts = getOptionCounts(entries, page);
            mostFrequent = counts.length > 0 ? counts[0].label : '—';
        } else {
            const streaks = relevantData.map(({ entries }) => calculateStreaksForData(entries));
            currentStreak = streaks.reduce((sum, s) => sum + s.current, 0);
            longestStreak = Math.max(...streaks.map(s => s.longest), 0);
            const counts = getOptionCounts(allEntries, { options: [] });
            mostFrequent = counts.length > 0 ? counts[0].label : '—';
        }

        document.getElementById('total-days').textContent = totalDays;
        document.getElementById('current-streak').textContent = currentStreak;
        document.getElementById('longest-streak').textContent = longestStreak;
        document.getElementById('most-frequent').textContent = mostFrequent;

        renderDistribution(relevantData);
        renderTrend(relevantData);
        renderPageComparison(relevantData);

        pageComparisonSection.style.display = relevantData.length > 1 ? 'block' : 'none';

        loadingEl.style.display = 'none';
        resultsEl.style.display = 'block';
    }

    function renderDistribution(relevantData) {
        const chart = document.getElementById('distribution-chart');
        chart.innerHTML = '';

        const entries = relevantData.flatMap(d => d.entries);
        if (entries.length === 0) {
            chart.innerHTML = '<div class="empty-analysis">No data for this period.</div>';
            return;
        }

        const options = relevantData.length === 1 ? relevantData[0].page.options : [];
        const counts = getOptionCounts(entries, { options });
        const max = Math.max(...counts.map(c => c.count), 1);

        counts.forEach(c => {
            const row = document.createElement('div');
            row.className = 'bar-row';
            const pct = Math.round((c.count / entries.length) * 100);
            row.innerHTML = `
                <span class="bar-label" title="${c.label}">${c.label}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${(c.count / max) * 100}%; background: ${c.color || ''}">
                        <span class="bar-value">${pct}%</span>
                    </div>
                </div>
                <span class="bar-count">${c.count}</span>
            `;
            chart.appendChild(row);
        });
    }

    function renderTrend(relevantData) {
        const chart = document.getElementById('trend-chart');
        const title = chart.previousElementSibling;
        chart.innerHTML = '';

        const entries = relevantData.flatMap(d => d.entries);
        if (entries.length === 0) {
            chart.innerHTML = '<div class="empty-analysis">No data for this period.</div>';
            if (title) title.textContent = scopeSelect.value === 'weekly' ? 'Daily Trend' : 'Monthly Trend';
            return;
        }

        const scope = scopeSelect.value;
        const trend = scope === 'weekly' ? getWeeklyTrend(entries) : getMonthlyTrend(entries);
        const max = Math.max(...trend.map(t => t.count), 1);

        if (title) title.textContent = scope === 'weekly' ? 'Daily Trend' : 'Monthly Trend';

        trend.forEach(t => {
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <span class="bar-label">${t.label}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${(t.count / max) * 100}%">
                        <span class="bar-value">${t.count}</span>
                    </div>
                </div>
                <span class="bar-count">${t.count}</span>
            `;
            chart.appendChild(row);
        });
    }

    function getWeeklyTrend(entries) {
        const { start } = getWeekRange(weekSelect.value);
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push({ label: dayNames[d.getDay()], count: 0, key: getDateKey(d) });
        }
        entries.forEach(e => {
            const day = days.find(d => d.key === e.date);
            if (day) day.count++;
        });
        return days;
    }

    function renderPageComparison(relevantData) {
        const chart = document.getElementById('page-comparison-chart');
        chart.innerHTML = '';

        const comparison = getPageComparison(relevantData);
        const max = Math.max(...comparison.map(c => c.count), 1);

        comparison.forEach(c => {
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <span class="bar-label">${c.icon} ${c.name}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${(c.count / max) * 100}%">
                        <span class="bar-value">${c.count}</span>
                    </div>
                </div>
                <span class="bar-count">${c.count}</span>
            `;
            chart.appendChild(row);
        });
    }

    function formatPageDisplayName(page) {
        const icon = getPageIcon(page);
        let name = page.name.trim();
        if (name.startsWith(icon)) {
            name = name.substring(icon.length).trim();
        }
        const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        return `${icon} ${formatted}`;
    }

    async function init() {
        populateYearSelect('year-select');
        populateWeekSelect();
        monthSelect.value = new Date().getMonth();
        yearSelect.value = new Date().getFullYear();

        const result = await loadPages(true);
        pages = result.pages || [];

        pages.forEach(page => {
            const option = document.createElement('option');
            option.value = page.id;
            option.textContent = formatPageDisplayName(page);
            pageSelect.appendChild(option);
        });

        updateControls();
        await runAnalysis();
    }

    function populateWeekSelect() {
        const currentDate = new Date();
        weekSelect.innerHTML = '';

        for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(currentDate.getDate() - (weekOffset * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekEnd.getDate() - 6);

            const formatDate = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
            const option = document.createElement('option');
            option.value = getDateKey(weekStart);
            option.textContent = `${formatDate(weekStart)} – ${formatDate(weekEnd)}`;
            if (weekOffset === 0) option.selected = true;
            weekSelect.appendChild(option);
        }
    }

    scopeSelect.addEventListener('change', () => {
        updateControls();
        runAnalysis();
    });
    pageSelect.addEventListener('change', runAnalysis);
    yearSelect.addEventListener('change', runAnalysis);
    monthSelect.addEventListener('change', runAnalysis);
    weekSelect.addEventListener('change', runAnalysis);

    init();
}

/* ---------- Highlights page ---------- */
function initHighlightsPage() {
    if (!requireAuth()) return;

    const yearSelect = populateYearSelect('year-select');
    const grid = document.getElementById('highlights-grid');

    const type = HIGHLIGHTS_PAGE_ID;
    let currentData = {};
    let streakData = {};

    async function loadStreakData() {
        const currentYear = new Date().getFullYear();
        streakData = await loadData(type, currentYear);
    }

    async function render() {
        const year = parseInt(yearSelect.value, 10);
        currentData = await loadData(type, year);
        await loadStreakData();
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
        updateStreakStatus();
    }

    function updateStreakStatus() {
        const streakEl = document.getElementById('streak-status');
        if (!streakEl) return;
        const streak = calculateAnyStreak(streakData);
        streakEl.textContent = streak > 0 ? `🔥 ${streak} day${streak === 1 ? '' : 's'} of highlights` : '';
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
            await loadStreakData();
            updateStreakStatus();
        }, 800);
    }

    yearSelect.addEventListener('change', render);
    render();
}

/* ---------- Shared UI helpers ---------- */
/* ---------- Theme system ---------- */
function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || 'candy-dreams';
    } catch (e) {
        return 'candy-dreams';
    }
}

function getSavedThemeMode() {
    try {
        return localStorage.getItem(THEME_MODE_KEY) || 'day';
    } catch (e) {
        return 'day';
    }
}

function saveTheme(themeId) {
    try {
        localStorage.setItem(THEME_KEY, themeId);
    } catch (e) {}
}

function saveThemeMode(mode) {
    try {
        localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (e) {}
}

function applyTheme(themeId, mode) {
    document.body.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-mode', mode);
    renderDecorations(themeId);
}

function renderDecorations(themeId) {
    const container = document.querySelector('.bg-decoration');
    if (!container) return;

    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    container.innerHTML = '';

    theme.decorations.forEach(decor => {
        const span = document.createElement('span');
        span.className = decor.class;
        if (decor.emoji) {
            span.textContent = decor.emoji;
        }
        container.appendChild(span);
    });
}

function initTheme() {
    const savedTheme = getSavedTheme();
    const savedMode = getSavedThemeMode();
    applyTheme(savedTheme, savedMode);
}

function openThemeModal() {
    const modal = document.getElementById('theme-modal');
    const grid = document.getElementById('theme-grid');
    const toggle = document.getElementById('day-night-toggle');
    const closeBtn = document.getElementById('theme-modal-close');
    if (!modal || !grid) return;

    const currentTheme = getSavedTheme();
    const currentMode = getSavedThemeMode();

    grid.innerHTML = '';
    THEMES.forEach(theme => {
        const option = document.createElement('div');
        option.className = `theme-option ${theme.id === currentTheme ? 'active' : ''}`;
        option.innerHTML = `
            <div class="theme-preview" style="background: ${theme.preview}"></div>
            <div class="theme-name">${theme.name}</div>
        `;
        option.addEventListener('click', () => {
            saveTheme(theme.id);
            applyTheme(theme.id, currentMode);
            grid.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
            option.classList.add('active');
        });
        grid.appendChild(option);
    });

    function updateToggleText() {
        const mode = getSavedThemeMode();
        toggle.textContent = mode === 'day' ? '🌙' : '☀️';
        toggle.title = mode === 'day' ? 'Switch to night mode' : 'Switch to day mode';
    }

    toggle.onclick = () => {
        const newMode = getSavedThemeMode() === 'day' ? 'night' : 'day';
        saveThemeMode(newMode);
        applyTheme(getSavedTheme(), newMode);
        updateToggleText();
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    modal.querySelector('.modal-backdrop').onclick = () => {
        modal.style.display = 'none';
    };

    updateToggleText();
    modal.style.display = 'flex';
}

function setupThemeButtons() {
    document.querySelectorAll('#theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openThemeModal();
        });
    });
}

function setupLogoutButtons() {
    document.querySelectorAll('.logout-btn, .logout-btn-in-dropdown').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.href = 'login.html';
        });
    });
}

function updateAvatarInitials() {
    const user = getCurrentUser();
    const initial = user ? user.charAt(0).toUpperCase() : '?';
    document.querySelectorAll('#avatar-initial').forEach(el => {
        el.textContent = initial;
    });
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.textContent = initial;
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar) headerAvatar.textContent = initial;
}

async function initProfilePage() {
    if (!requireAuth()) return;

    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const usernameInput = document.getElementById('profile-username-input');
    const genderInput = document.getElementById('profile-gender');
    const ageInput = document.getElementById('profile-age');
    const dobInput = document.getElementById('profile-dob');
    const professionInput = document.getElementById('profile-profession');
    const locationInput = document.getElementById('profile-location');
    const bioInput = document.getElementById('profile-bio');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const profileMessage = document.getElementById('profile-message');
    const passwordMessage = document.getElementById('password-message');

    async function loadProfile() {
        try {
            const response = await fetch('/api/auth/me', { headers: getAuthHeaders() });
            if (handleAuthError(response)) return;
            const result = await response.json();
            if (!result.success) return;

            const user = result.user;
            if (usernameEl) usernameEl.textContent = user.username || '';
            if (emailEl) emailEl.textContent = user.email || '';
            if (usernameInput) usernameInput.value = user.username || '';
            if (genderInput) genderInput.value = user.gender || '';
            if (ageInput) ageInput.value = user.age !== null && user.age !== undefined ? user.age : '';
            if (dobInput) dobInput.value = user.date_of_birth ? user.date_of_birth.slice(0, 10) : '';
            if (professionInput) professionInput.value = user.profession || '';
            if (locationInput) locationInput.value = user.location || '';
            if (bioInput) bioInput.value = user.bio || '';
            updateAvatarInitials();
        } catch (err) {
            console.error('Load profile failed:', err);
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(profileMessage, '', '');
            const body = {
                username: usernameInput.value,
                gender: genderInput.value,
                age: ageInput.value,
                dateOfBirth: dobInput.value,
                profession: professionInput.value,
                location: locationInput.value,
                bio: bioInput.value
            };
            try {
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(body)
                });
                if (handleAuthError(response)) return;
                const result = await response.json();
                if (result.success) {
                    showMessage(profileMessage, 'Profile saved ✨', 'success');
                    localStorage.setItem('journalUser', result.user.username);
                    updateAvatarInitials();
                    if (usernameEl) usernameEl.textContent = result.user.username;
                } else {
                    showMessage(profileMessage, result.message || 'Failed to save profile.', 'error');
                }
            } catch (err) {
                console.error('Save profile failed:', err);
                showMessage(profileMessage, 'Unable to save. Please try again.', 'error');
            }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(passwordMessage, '', '');
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                showMessage(passwordMessage, 'New passwords do not match.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/password', {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
                });
                if (handleAuthError(response)) return;
                const result = await response.json();
                if (result.success) {
                    showMessage(passwordMessage, 'Password updated ✨', 'success');
                    passwordForm.reset();
                } else {
                    showMessage(passwordMessage, result.message || 'Failed to update password.', 'error');
                }
            } catch (err) {
                console.error('Update password failed:', err);
                showMessage(passwordMessage, 'Unable to update password. Please try again.', 'error');
            }
        });
    }

    await loadProfile();
}

function setupUserMenu() {
    updateAvatarInitials();
    setupLogoutButtons();

    document.querySelectorAll('#avatar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = btn.parentElement.querySelector('#user-dropdown');
            if (!dropdown) return;
            const isOpen = dropdown.style.display === 'block';
            document.querySelectorAll('#user-dropdown').forEach(d => d.style.display = 'none');
            dropdown.style.display = isOpen ? 'none' : 'block';
        });
    });

    document.querySelectorAll('#user-dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', (e) => e.stopPropagation());
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('#user-dropdown').forEach(d => d.style.display = 'none');
    });

    document.querySelectorAll('#edit-pages-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                document.querySelectorAll('#user-dropdown').forEach(d => d.style.display = 'none');
                const editBtn = document.getElementById('edit-pages-btn');
                if (editBtn) editBtn.click();
            } else {
                window.location.href = 'index.html?edit=1';
            }
        });
    });
}

function showCurrentUser() {
    updateAvatarInitials();
}
