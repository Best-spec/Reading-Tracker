const STORAGE_FRIENDS = 'readflow_friends';
const STORAGE_REQUESTS = 'readflow_friend_requests';

const SAMPLE_FRIENDS = [
    { id: 1, username: 'wanida', name: 'วนิดา', avatar: 'https://i.pravatar.cc/150?img=32', online: true, reading: { title: 'Atomic Habits', progress: 46, pagesRead: 92 } },
    { id: 2, username: 'ton', name: 'โตน', avatar: 'https://i.pravatar.cc/150?img=12', online: false, reading: { title: 'Deep Work', progress: 73, pagesRead: 219 } }
];

const SAMPLE_REQUESTS = [
    { id: 101, username: 'pine', name: 'ไพน์', avatar: 'https://i.pravatar.cc/150?img=47' },
    { id: 102, username: 'mew', name: 'มีว', avatar: 'https://i.pravatar.cc/150?img=18' }
];

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn('Cannot parse stored data for', key, e);
        return fallback;
    }
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFriends() {
    return loadFromStorage(STORAGE_FRIENDS, SAMPLE_FRIENDS);
}

function getRequests() {
    return loadFromStorage(STORAGE_REQUESTS, SAMPLE_REQUESTS);
}

function setFriends(friends) {
    saveToStorage(STORAGE_FRIENDS, friends);
}

function setRequests(requests) {
    saveToStorage(STORAGE_REQUESTS, requests);
}

function renderSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'bar-chart-2', label: 'Statistics', href: 'stats.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },
        { icon: 'users', label: 'Friends', href: 'friends.html' },
        { icon: 'user', label: 'Profile', href: '#' },
        { icon: 'settings', label: 'Settings', href: '#' }
    ];

    document.getElementById('nav-menu').innerHTML = menu.map(item => `
        <button class="nav-item ${current === item.href ? 'active' : ''}" onclick="window.location.href='${item.href}'">
            <i data-lucide="${item.icon}" style="width: 20px;"></i>
            <span>${item.label}</span>
        </button>
    `).join('');
    lucide.createIcons();
}

function formatProgress(progress) {
    return `${progress}%`; 
}

function renderFriends() {
    const friends = getFriends();
    const container = document.getElementById('friends-list');

    if (!friends.length) {
        container.innerHTML = `<p style="color: var(--text-muted);">ยังไม่มีเพื่อนในระบบ ลองเพิ่มเพื่อนดู</p>`;
        return;
    }

    container.innerHTML = friends.map(friend => {
        const onlineClass = friend.online ? 'status-online' : 'status-offline';
        const onlineText = friend.online ? 'Online' : 'Offline';

        return `
            <div class="friend-card">
                <img class="friend-avatar" src="${friend.avatar}" alt="${friend.name}" />
                <div class="friend-info">
                    <div class="friend-name">
                        ${friend.name}
                        <span class="status-badge-small ${onlineClass}">
                            <i data-lucide="circle"></i> ${onlineText}
                        </span>
                    </div>
                    <div class="friend-stats">
                        <div>กำลังอ่าน: <strong>${friend.reading.title}</strong></div>
                        <div>ความคืบหน้า: <strong>${formatProgress(friend.reading.progress)}</strong></div>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-remove" onclick="removeFriend(${friend.id})">ลบเพื่อน</button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function renderRequests() {
    const requests = getRequests();
    const container = document.getElementById('requests-list');

    if (!requests.length) {
        container.innerHTML = `<p style="color: var(--text-muted);">ไม่มีคำขอเป็นเพื่อนใหม่</p>`;
        return;
    }

    container.innerHTML = requests.map(req => `
        <div class="friend-card">
            <img class="friend-avatar" src="${req.avatar}" alt="${req.name}" />
            <div class="friend-info">
                <div class="friend-name">${req.name}</div>
                <div class="friend-stats">@${req.username}</div>
            </div>
            <div class="friend-actions">
                <button class="btn btn-accept" onclick="acceptRequest(${req.id})">ยอมรับ</button>
                <button class="btn btn-decline" onclick="declineRequest(${req.id})">ปฏิเสธ</button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function addFriendRequest() {
    const input = document.getElementById('friend-search');
    const value = input.value.trim();
    if (!value) {
        alert('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
        return;
    }

    const requests = getRequests();
    const friends = getFriends();
    const alreadyRequested = requests.some(r => r.username === value);
    const alreadyFriend = friends.some(f => f.username === value);

    if (alreadyFriend) {
        alert('คุณเป็นเพื่อนกันอยู่แล้ว');
        return;
    }

    if (alreadyRequested) {
        alert('คุณได้ส่งคำขอแล้ว รอการตอบรับ');
        return;
    }

    const newRequest = {
        id: Date.now(),
        username: value,
        name: value.includes('@') ? value.split('@')[0] : value,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(value)}`
    };

    setRequests([newRequest, ...requests]);
    input.value = '';
    renderRequests();
    alert('ส่งคำขอเป็นเพื่อนไปแล้ว');
}

function acceptRequest(requestId) {
    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const friends = getFriends();
    const newFriend = {
        id: Date.now(),
        username: request.username,
        name: request.name,
        avatar: request.avatar,
        online: Math.random() > 0.4,
        reading: {
            title: 'ไม่ระบุหนังสือ',
            progress: Math.floor(Math.random() * 90) + 10,
            pagesRead: Math.floor(Math.random() * 200) + 20
        }
    };

    setFriends([newFriend, ...friends]);
    setRequests(requests.filter(r => r.id !== requestId));

    renderRequests();
    renderFriends();
}

function declineRequest(requestId) {
    const requests = getRequests();
    setRequests(requests.filter(r => r.id !== requestId));
    renderRequests();
}

function removeFriend(friendId) {
    if (!confirm('ยืนยันการลบเพื่อน?')) return;
    const friends = getFriends();
    setFriends(friends.filter(f => f.id !== friendId));
    renderFriends();
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
    renderSidebar();
    updateOnlineStatus();
    renderRequests();
    renderFriends();

    document.getElementById('send-request-btn').addEventListener('click', addFriendRequest);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});
