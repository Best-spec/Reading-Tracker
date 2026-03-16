const STORAGE_KEY = 'readflow_reading_logs';

function getSavedLogs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('Cannot parse saved reading logs', e);
        return {};
    }
}

function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatMonthYear(date) {
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
}

function minutesToLabel(min) {
    if (!min || min <= 0) return 'ยังไม่อ่าน';
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    const parts = [];
    if (hours) parts.push(`${hours} ชม.`);
    if (mins) parts.push(`${mins} นาที`);
    return parts.join(' ');
}

function getLevelForMinutes(min) {
    if (!min || min <= 0) return 'none';
    if (min <= 30) return 'low';
    if (min <= 60) return 'medium';
    return 'high';
}

function computeStreak(logs) {
    let streak = 0;
    let current = new Date();

    while (true) {
        const key = formatDateKey(current);
        const minutes = logs[key] ?? 0;
        if (minutes > 0) {
            streak += 1;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

function getMonthTotals(year, month, logs) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0;
    let daysWithReading = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const minutes = logs[key] ?? 0;
        if (minutes > 0) {
            total += minutes;
            daysWithReading += 1;
        }
    }

    return { total, daysWithReading, daysInMonth };
}

function renderStats(year, month, logs) {
    const { total, daysWithReading, daysInMonth } = getMonthTotals(year, month, logs);
    const streak = computeStreak(logs);
    const avg = daysWithReading ? Math.round(total / daysWithReading) : 0;

    document.getElementById('total-time-card').innerHTML = `
        <h4>เวลาที่อ่านเดือนนี้</h4>
        <p style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 800;">${minutesToLabel(total)}</p>
    `;

    document.getElementById('streak-card').innerHTML = `
        <h4>Streak</h4>
        <p style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 800;">${streak} วัน</p>
        <p style="margin-top: 0.25rem; font-size: 0.85rem; color: var(--text-muted);">(อ่านติดต่อกันล่าสุด)</p>
    `;

    document.getElementById('avg-time-card').innerHTML = `
        <h4>เฉลี่ยต่อวันที่อ่าน</h4>
        <p style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: 800;">${minutesToLabel(avg)}</p>
        <p style="margin-top: 0.25rem; font-size: 0.85rem; color: var(--text-muted);">จาก ${daysWithReading} วัน</p>
    `;
}

function renderCalendar(year, month, logs) {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay(); // 0=Sunday

    const todayKey = formatDateKey(new Date());

    const totalCells = 42;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        const dayNumber = i - startOffset + 1;
        const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

        if (!isCurrentMonth) {
            cell.classList.add('inactive');
            grid.appendChild(cell);
            continue;
        }

        const date = new Date(year, month, dayNumber);
        const key = formatDateKey(date);
        const minutes = logs[key] ?? 0;
        const level = getLevelForMinutes(minutes);

        if (key === todayKey) {
            cell.classList.add('active');
        }

        cell.classList.add(`level-${level}`);
        cell.innerHTML = `
            <div class="date">${dayNumber}</div>
            <div class="minutes">${minutesToLabel(minutes)}</div>
        `;

        cell.addEventListener('click', () => {
            const existing = logs[key] ?? 0;
            const promptText = `เวลาอ่าน (นาที) สำหรับ ${date.toLocaleDateString('th-TH')} (ว่าง=ลบ)`;
            const answer = prompt(promptText, existing || '');
            if (answer === null) return;
            const value = parseInt(answer);
            if (isNaN(value) || value < 0) {
                alert('กรุณากรอกค่าตัวเลขที่เป็นบวก');
                return;
            }
            if (value === 0) {
                delete logs[key];
            } else {
                logs[key] = value;
            }
            saveLogs(logs);
            renderCalendar(year, month, logs);
            renderStats(year, month, logs);
        });

        grid.appendChild(cell);
    }

    const title = document.getElementById('calendar-title');
    title.innerText = formatMonthYear(new Date(year, month, 1));
}

function initSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },        { icon: 'users', label: 'Groups', href: 'groups.html' },        { icon: 'users', label: 'Friends', href: 'friends.html' },
        { icon: 'user', label: 'Profile', href: 'profile.html' },
        { icon: 'settings', label: 'Settings', href: 'settings.html' }
    ];

    document.getElementById('nav-menu').innerHTML = menu.map(item => `
        <button class="nav-item ${current === item.href ? 'active' : ''}" onclick="window.location.href='${item.href}'">
            <i data-lucide="${item.icon}" style="width: 20px;"></i>
            <span>${item.label}</span>
        </button>
    `).join('');
    lucide.createIcons();
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const container = document.getElementById('online-status');
    container.innerHTML = `<i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" style="width: 16px;"></i> ${isOnline ? 'Online' : 'Offline'}`;
    container.style.background = isOnline ? '#f0fdf4' : '#fef2f2';
    container.style.color = isOnline ? '#166534' : '#991b1b';
    lucide.createIcons();
}

window.addEventListener('load', () => {
    initSidebar();
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const now = new Date();
    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth();
    const logs = getSavedLogs();

    renderCalendar(currentYear, currentMonth, logs);
    renderStats(currentYear, currentMonth, logs);

    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth -= 1;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        }
        renderCalendar(currentYear, currentMonth, logs);
        renderStats(currentYear, currentMonth, logs);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        renderCalendar(currentYear, currentMonth, logs);
        renderStats(currentYear, currentMonth, logs);
    });

    document.getElementById('save-today-btn').addEventListener('click', () => {
        const input = document.getElementById('today-minutes');
        const val = parseInt(input.value);
        if (isNaN(val) || val < 0) {
            alert('กรุณากรอกตัวเลขที่ถูกต้อง');
            return;
        }
        const key = formatDateKey(new Date());
        if (val === 0) {
            delete logs[key];
        } else {
            logs[key] = val;
        }
        saveLogs(logs);
        renderCalendar(currentYear, currentMonth, logs);
        renderStats(currentYear, currentMonth, logs);
        input.value = '';
    });
});
