const SETTINGS_STORAGE_KEY = 'readflow_settings';

function getSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('ไม่สามารถโหลดการตั้งค่าได้', e);
        return {};
    }
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function updateOnlineBadge() {
    const settings = getSettings();
    const mustShowOnline = settings.showOnline !== false;
    const isOnline = navigator.onLine && mustShowOnline;
    const container = document.getElementById('online-status');

    container.innerHTML = `<i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" style="width: 16px;"></i> ${isOnline ? 'Online' : 'Offline'}`;
    container.style.background = isOnline ? '#f0fdf4' : '#fef2f2';
    container.style.color = isOnline ? '#166534' : '#991b1b';

    lucide.createIcons();
}

function setOnlineToggle(value) {
    const checkbox = document.getElementById('online-toggle');
    checkbox.checked = value;
    const settings = getSettings();
    settings.showOnline = value;
    saveSettings(settings);
    updateOnlineBadge();
}

function handleOnlineToggle() {
    setOnlineToggle(document.getElementById('online-toggle').checked);
}

function showPasswordFeedback(text, type) {
    const feedback = document.getElementById('password-feedback');
    feedback.innerText = text;
    feedback.classList.remove('success', 'error');
    if (type) feedback.classList.add(type);
}

function handlePasswordChange(e) {
    e.preventDefault();
    const current = document.getElementById('current-password').value.trim();
    const next = document.getElementById('new-password').value.trim();
    const confirm = document.getElementById('confirm-password').value.trim();

    const storedPassword = localStorage.getItem('readflow_password') || 'password123';

    if (current !== storedPassword) {
        showPasswordFeedback('รหัสผ่านปัจจุบันไม่ถูกต้อง', 'error');
        return;
    }

    if (next.length < 8) {
        showPasswordFeedback('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 'error');
        return;
    }

    if (next !== confirm) {
        showPasswordFeedback('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
        return;
    }

    localStorage.setItem('readflow_password', next);
    showPasswordFeedback('อัปเดตรหัสผ่านเรียบร้อยแล้ว', 'success');
    document.getElementById('password-form').reset();
}

function openDeleteModal() {
    const modal = document.getElementById('confirm-delete-modal');
    modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('confirm-delete-modal');
    modal.style.display = 'none';
}

function confirmDeleteAccount() {
    // ล้างข้อมูลจำลองทั้งหมดในเครื่อง
    localStorage.clear();
    alert('ลบบัญชีเรียบร้อยแล้ว คุณจะถูกพาไปยังหน้าเข้าสู่ระบบ');
    window.location.href = '../auth/login.html';
}

function initSettingsPage() {
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
    document.getElementById('online-toggle').addEventListener('change', handleOnlineToggle);
    document.getElementById('delete-account-btn').addEventListener('click', openDeleteModal);

    // ตั้งค่าเริ่มต้น
    const settings = getSettings();
    setOnlineToggle(settings.showOnline !== false);
    updateOnlineBadge();

    window.addEventListener('online', updateOnlineBadge);
    window.addEventListener('offline', updateOnlineBadge);
}

window.addEventListener('load', initSettingsPage);
