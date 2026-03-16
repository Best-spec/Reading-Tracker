// --- DATA ---
const apiKey = ""; 
const CURRENT_BOOKS = [
    { id: 1, title: "The Psychology of Money", author: "Morgan Housel", progress: 65, cover: "https://images.unsplash.com/photo-1592492159418-39f319320569?w=200&h=300&fit=crop" },
    { id: 2, title: "Atomic Habits", author: "James Clear", progress: 30, cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop" },
    { id: 3, title: "Deep Work", author: "Cal Newport", progress: 85, cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=300&fit=crop" }
];
const TREND_DATA = [
    { day: 'จ.', hours: 1.5 }, { day: 'อ.', hours: 2.1 }, { day: 'พ.', hours: 0.8 },
    { day: 'พฤ.', hours: 2.5 }, { day: 'ศ.', hours: 1.2 }, { day: 'ส.', hours: 3.0 }, { day: 'อา.', hours: 2.4 }
];

let isSpeaking = false;
let audioPlayer = null;

// --- CORE RENDERERS ---

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
    const stats = [
        { title: "เวลาอ่านวันนี้", value: "1 ชม. 20 นาที", icon: 'clock', bg: 'bg-orange-50', color: '#f97316', trend: '+15%' },
        { title: "เวลาอ่านสัปดาห์นี้", value: "8 ชม. 45 นาที", icon: 'calendar', bg: 'bg-indigo-50', color: '#4f46e5', trend: '+2.4 ชม' },
        { title: "เวลาอ่านเดือนนี้", value: "32 ชม. 10 นาที", icon: 'trending-up', bg: 'bg-emerald-50', color: '#10b981', trend: 'Record!' }
    ];
    document.getElementById('stats-grid').innerHTML = stats.map(s => `
        <div class="stat-card" style="width: 100%;">
            <div class="stat-header">
                <div class="stat-icon-box" style="background: ${s.color}15; color: ${s.color}; display: flex; justify-content: space-between; width: 100%">
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

function renderChart() {
    const maxHours = Math.max(...TREND_DATA.map(d => d.hours));
    document.getElementById('chart-container').innerHTML = TREND_DATA.map(item => `
        <div class="chart-col">
            <div class="bar-wrapper">
                <div class="bar" style="height: ${(item.hours / maxHours) * 100}%"></div>
            </div>
            <span class="bar-label">${item.day}</span>
        </div>
    `).join('');
}

function renderBooks() {
    document.getElementById('books-list').innerHTML = CURRENT_BOOKS.map(book => `
        <div class="book-item">
            <img src="${book.cover}" class="book-cover" alt="${book.title}" />
            <button class="ai-trigger" onclick="handleAIsurvey(${book.id})">
                <i data-lucide="sparkles" style="width: 14px;"></i>
            </button>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${book.progress}%"></div>
                </div>
                <div class="progress-text">${book.progress}% อ่านไปแล้ว</div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- GEMINI API LOGIC ---

async function fetchAI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function fetchDailyInsight() {
    try {
        const text = await fetchAI("Generate a very short, punchy motivational sentence about reading in Thai (max 10 words).");
        document.getElementById('daily-insight').innerText = text;
    } catch (e) {
        document.getElementById('daily-insight').innerText = "มาเริ่มอ่านกันเถอะ!";
    }
}

async function handleAIsurvey(bookId) {
    const book = CURRENT_BOOKS.find(b => b.id === bookId);
    openModal("Gemini กำลังสรุป...", true);
    try {
        const prompt = `Summarize 3 short key takeaways of "${book.title}" in Thai.`;
        const summary = await fetchAI(prompt);
        showContent(book.title, summary);
    } catch (e) {
        showContent("Error", "ไม่สามารถเชื่อมต่อ AI ได้");
    }
}

async function handleRecommend() {
    openModal("Gemini กำลังแนะนำ...", true);
    try {
        const titles = CURRENT_BOOKS.map(b => b.title).join(", ");
        const prompt = `Based on: ${titles}, recommend 2 other books in Thai briefly.`;
        const res = await fetchAI(prompt);
        showContent("AI แนะนำหนังสือใหม่", res);
    } catch (e) {
        showContent("Error", "ไม่สามารถเชื่อมต่อ AI ได้");
    }
}

// --- TTS ENGINE ---
async function handleSpeak(text) {
    const btn = document.getElementById('tts-btn');
    if (isSpeaking && audioPlayer) {
        audioPlayer.pause();
        isSpeaking = false;
        btn.innerText = "✨ ฟังเสียงสรุป";
        return;
    }

    btn.innerText = "กำลังสร้างเสียง...";
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Read this summary clearly: ${text}` }] }],
                generationConfig: { 
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
                }
            })
        });

        const result = await response.json();
        const pcmData = result.candidates[0].content.parts[0].inlineData.data;
        
        const blob = pcmToWavBlob(pcmData, 24000);
        audioPlayer = new Audio(URL.createObjectURL(blob));
        audioPlayer.onended = () => { isSpeaking = false; btn.innerText = "✨ ฟังเสียงสรุป"; };
        audioPlayer.play();
        isSpeaking = true;
        btn.innerText = "⏹️ หยุดฟัง";
    } catch (e) {
        btn.innerText = "เล่นเสียงไม่ได้";
    }
}

function pcmToWavBlob(base64, sampleRate) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const writeString = (off, s) => { for(let i=0;i<s.length;i++) view.setUint8(off+i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, 36 + len, true); writeString(8, 'WAVE');
    writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, len, true);
    return new Blob([header, bytes], { type: 'audio/wav' });
}

// --- UTILS ---
function openModal(title, isLoading) {
    const modal = document.getElementById('ai-modal');
    modal.style.display = 'flex';
    document.getElementById('modal-title').innerText = title;
    if (isLoading) {
        document.getElementById('modal-content').innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <i data-lucide="loader-2" style="width: 48px; height: 48px; color: var(--primary); animation: spin 1s linear infinite;"></i>
                <p style="margin-top: 1rem; color: var(--text-muted);">กำลังประมวลผล...</p>
            </div>
        `;
        lucide.createIcons();
    }
}

function showContent(title, text) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-content').innerHTML = `
        <div style="color: var(--text-main); line-height: 1.6; white-space: pre-wrap;">${text}</div>
        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <button id="tts-btn" onclick="handleSpeak(\`${text.replace(/[`'"]/g, '')}\`)" class="btn btn-primary" style="background: var(--primary)">
                <i data-lucide="volume-2"></i> ✨ ฟังเสียงสรุป
            </button>
            <button onclick="closeModal()" class="btn btn-outline" style="flex:1">ปิด</button>
        </div>
    `;
    lucide.createIcons();
}

function closeModal() {
    if (audioPlayer) audioPlayer.pause();
    isSpeaking = false;
    document.getElementById('ai-modal').style.display = 'none';
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const container = document.getElementById('online-status');
    container.innerHTML = `<i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" style="width: 16px;"></i> ${isOnline ? 'Online Status' : 'Offline Mode'}`;
    container.style.background = isOnline ? '#f0fdf4' : '#fef2f2';
    container.style.color = isOnline ? '#166534' : '#991b1b';
    lucide.createIcons();
}

// --- ANIMATIONS ---
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.append(style);

// --- INIT ---
window.addEventListener('load', () => {
    renderSidebar();
    renderStats();
    renderChart();
    renderBooks();
    updateOnlineStatus();
    fetchDailyInsight();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});