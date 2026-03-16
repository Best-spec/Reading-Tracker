// --- Sample data ---
const STATISTICS = {
    totalReading: { label: "เวลาทั้งหมดที่อ่าน", value: "138 ชม. 20 นาที", icon: "clock", trend: "+12%" },
    avgPerDay: { label: "เฉลี่ยต่อวัน", value: "2 ชม. 15 นาที", icon: "sunrise", trend: "+0.5 ชม." },
    sessions: { label: "จำนวนเซสชันอ่าน", value: "56 ครั้ง", icon: "repeat", trend: "เพิ่มขึ้น" }
};

const DAILY_DATA = [
    { label: 'จ.', hours: 2.2 }, { label: 'อ.', hours: 1.8 }, { label: 'พ.', hours: 2.5 },
    { label: 'พฤ.', hours: 1.4 }, { label: 'ศ.', hours: 3.0 }, { label: 'ส.', hours: 2.7 }, { label: 'อา.', hours: 2.9 }
];

const WEEKLY_DATA = [
    { label: 'สัปดาห์ 1', hours: 15.5 },
    { label: 'สัปดาห์ 2', hours: 17.2 },
    { label: 'สัปดาห์ 3', hours: 18.1 },
    { label: 'สัปดาห์ 4', hours: 16.9 }
];

const TOP_BOOKS = [
    { title: "Atomic Habits", author: "James Clear", hours: 28.4, cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop" },
    { title: "The Psychology of Money", author: "Morgan Housel", hours: 21.3, cover: "https://images.unsplash.com/photo-1592492159418-39f319320569?w=200&h=300&fit=crop" },
    { title: "Deep Work", author: "Cal Newport", hours: 19.8, cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=300&fit=crop" }
];

// --- Sidebar ---
function renderSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'bar-chart-2', label: 'Statistics', href: 'stats.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },
        { icon: 'users', label: 'Friends', href: 'friends.html' },
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

function renderStats() {
    const stats = Object.values(STATISTICS).map(stat => ({
        title: stat.label,
        value: stat.value,
        icon: stat.icon,
        trend: stat.trend
    }));

    document.getElementById('stats-grid').innerHTML = stats.map(s => `
        <div class="stat-card" style="width: 100%;">
            <div class="stat-header">
                <div class="stat-icon-box" style="background: var(--primary)15; color: var(--primary); display: flex; justify-content: space-between; width: 100%">
                    <i data-lucide="${s.icon}"></i>
                </div>
                <span class="trend-label">${s.trend}</span>
            </div>
            <p class="stat-title">${s.title}</p>
            <h4 class="stat-value">${s.value}</h4>
        </div>
    `).join('');

    lucide.createIcons();
}

function renderBarChart(containerId, data) {
    const max = Math.max(...data.map(d => d.hours));
    document.getElementById(containerId).innerHTML = data.map(d => `
        <div class="chart-col">
            <div class="bar-wrapper">
                <div class="bar" style="height: ${Math.max((d.hours / max) * 100, 6)}%;"></div>
            </div>
            <span class="bar-label">${d.label}</span>
        </div>
    `).join('');
}

function renderTopBooks() {
    document.getElementById('most-read-list').innerHTML = TOP_BOOKS.map(book => `
        <div class="book-item">
            <img src="${book.cover}" class="book-cover" alt="${book.title}" />
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="progress-text">${book.hours.toFixed(1)} ชั่วโมงที่อ่าน</div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const container = document.getElementById('online-status');
    container.innerHTML = `<i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" style="width: 16px;"></i> ${isOnline ? 'Online Status' : 'Offline Mode'}`;
    container.style.background = isOnline ? '#f0fdf4' : '#fef2f2';
    container.style.color = isOnline ? '#166534' : '#991b1b';
    lucide.createIcons();
}

function loadInsights() {
    const insights = [
        "วันนี้อ่านต่ออีกนิด แล้วคุณจะเข้าใกล้เป้าหมาย", 
        "การอ่าน 15 นาทีทุกวัน สะสมแล้วได้ผลมากจริงๆ",
        "สถิติวันนี้ดีมาก! มาตั้งเป้าคืนนี้กันต่อ"
    ];
    const index = Math.floor(Math.random() * insights.length);
    document.getElementById('insight-text').innerText = insights[index];
}

window.addEventListener('load', () => {
    renderSidebar();
    renderStats();
    renderBarChart('daily-chart', DAILY_DATA);
    renderBarChart('weekly-chart', WEEKLY_DATA);
    renderTopBooks();
    updateOnlineStatus();
    loadInsights();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});
