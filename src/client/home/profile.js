const PROFILE_KEY = 'readflow_profile';
const BOOKS_KEY = 'readflow_books';

function getLocalProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('ไม่สามารถอ่านข้อมูลโปรไฟล์', e);
        return null;
    }
}

function saveLocalProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getLocalBooks() {
    try {
        const raw = localStorage.getItem(BOOKS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('ไม่สามารถอ่านข้อมูลหนังสือ', e);
        return [];
    }
}

function saveLocalBooks(books) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

function formatTimeLabel(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts = [];
    if (hrs) parts.push(`${hrs} ชม.`);
    if (mins || !hrs) parts.push(`${mins} นาที`);
    return parts.join(' ');
}

function renderSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },
        { icon: 'user', label: 'Profile', href: 'profile.html' },
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

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const container = document.getElementById('online-status');
    container.innerHTML = `<i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" style="width: 16px;"></i> ${isOnline ? 'Online Status' : 'Offline Mode'}`;
    container.style.background = isOnline ? '#f0fdf4' : '#fef2f2';
    container.style.color = isOnline ? '#166534' : '#991b1b';
    lucide.createIcons();
}

async function fetchRemoteProfile() {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/auth/profile', {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลโปรไฟล์จากเซิร์ฟเวอร์ได้');
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn(err);
        return null;
    }
}

function renderProfile(profile, books) {
    const avatarEl = document.getElementById('avatar');
    const usernameEl = document.getElementById('profile-username');
    const idEl = document.getElementById('profile-id');

    const displayName = profile.username || 'ผู้ใช้';
    usernameEl.innerText = displayName;
    idEl.innerText = `ID: ${profile.id ?? '-'}`;

    const avatar = profile.avatar || '';
    if (avatar) {
        avatarEl.style.backgroundImage = `url('${avatar}')`;
    } else {
        avatarEl.style.backgroundImage = `url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop')`;
    }

    const totalMinutes = books.reduce((sum, book) => {
        const readPages = book.readPages ?? 0;
        // ประมาณเวลาอ่าน 1 หน้าต่อ 1 นาที (ปรับได้ตามต้องการ)
        return sum + readPages;
    }, 0);

    const finishedCount = books.filter(b => (b.readPages ?? 0) >= (b.totalPages ?? 0) && (b.totalPages ?? 0) > 0).length;

    document.getElementById('total-reading').innerText = formatTimeLabel(totalMinutes);
    document.getElementById('books-finished').innerText = `${finishedCount} เล่ม`;
    document.getElementById('books-count').innerText = `${books.length} เล่ม`;
}

function openEditModal() {
    const profile = getLocalProfile() || {};
    const usernameInput = document.getElementById('input-username');
    const avatarUrlInput = document.getElementById('input-avatar-url');
    const fileInput = document.getElementById('input-avatar-file');

    usernameInput.value = profile.username || '';
    avatarUrlInput.value = profile.avatar || '';
    fileInput.value = '';

    document.getElementById('profile-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function handleProfileSave(e) {
    e.preventDefault();

    const username = document.getElementById('input-username').value.trim();
    const avatarUrl = document.getElementById('input-avatar-url').value.trim();
    const fileInput = document.getElementById('input-avatar-file');

    const profile = getLocalProfile() || {};
    profile.username = username || profile.username || 'ผู้ใช้';

    const setAvatar = (avatarData) => {
        if (avatarData) profile.avatar = avatarData;
        saveLocalProfile(profile);
        const books = getLocalBooks();
        renderProfile(profile, books);
        closeEditModal();
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
            setAvatar(reader.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        setAvatar(avatarUrl || profile.avatar);
    }
}

window.addEventListener('load', async () => {
    renderSidebar();
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const savedProfile = getLocalProfile() || {};
    const remoteProfile = await fetchRemoteProfile();
    const mergedProfile = { ...savedProfile, ...(remoteProfile ?? {}) };
    saveLocalProfile(mergedProfile);

    const books = getLocalBooks();
    renderProfile(mergedProfile, books);

    document.getElementById('profile-form').addEventListener('submit', handleProfileSave);
});
