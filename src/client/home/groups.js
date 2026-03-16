// --- Sample data ---
let currentUserName = "คุณ";

let groups = [
    {
        id: 1,
        name: "กลุ่มอ่านเช้า",
        description: "อ่านให้ครบเป้าหมายก่อนเริ่มงาน",
        joinCode: "MORNING",
        members: [
            { name: "มิน", minutes: 380 },
            { name: "ต้น", minutes: 320 },
            { name: "คุณ", minutes: 250 }
        ]
    },
    {
        id: 2,
        name: "คลับนิยาย",
        description: "อ่านนิยายแล้วมาคุยกันทุกสุดสัปดาห์",
        joinCode: "NOVEL",
        members: [
            { name: "แพรว", minutes: 430 },
            { name: "จิว", minutes: 390 },
            { name: "คุณ", minutes: 180 }
        ]
    }
];

let selectedGroupId = null;

function renderSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },
        { icon: 'users', label: 'Groups', href: 'groups.html' },
        { icon: 'bar-chart-2', label: 'Statistics', href: 'stats.html' },
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

function formatTime(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts = [];
    if (hrs > 0) parts.push(`${hrs} ชม.`);
    if (mins > 0) parts.push(`${mins} นาที`);
    return parts.length ? parts.join(' ') : '0 นาที';
}

function getSelectedGroup() {
    return groups.find(g => g.id === selectedGroupId);
}

function renderGroups() {
    const filter = document.getElementById('search-groups')?.value?.toLowerCase?.() || '';
    const wrapper = document.getElementById('groups-list');
    wrapper.innerHTML = groups
        .filter(g => !filter || g.name.toLowerCase().includes(filter) || g.description.toLowerCase().includes(filter) || g.joinCode.toLowerCase().includes(filter))
        .map(group => {
            const totalMinutes = group.members.reduce((acc, cur) => acc + cur.minutes, 0);
            return `
                <div class="group-card ${group.id === selectedGroupId ? 'active' : ''}" onclick="selectGroup(${group.id})">
                    <div class="group-header">
                        <div class="group-name">${group.name}</div>
                        <span class="group-meta">${group.members.length} สมาชิก</span>
                    </div>
                    <div class="group-meta">รหัส: ${group.joinCode}</div>
                    <div class="group-meta">เวลารวม ${formatTime(totalMinutes)}</div>
                    <div class="group-stats">
                        <div class="group-stat"><span>เฉลี่ย/คน</span><span>${formatTime(Math.round(totalMinutes / Math.max(group.members.length, 1)))}</span></div>
                        <div class="group-stat"><span>สูงสุด</span><span>${formatTime(Math.max(...group.members.map(m => m.minutes)))}</span></div>
                    </div>
                </div>
            `;
        }).join('');
}

function selectGroup(id) {
    selectedGroupId = id;
    renderGroups();
    renderGroupDetails();
}

function renderGroupDetails() {
    const group = getSelectedGroup();
    const details = document.getElementById('details-content');
    const emptyState = document.getElementById('empty-state');

    if (!group) {
        details.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    details.style.display = 'block';

    document.getElementById('detail-group-name').innerText = group.name;
    document.getElementById('detail-group-desc').innerText = group.description;

    const totalMinutes = group.members.reduce((acc, cur) => acc + cur.minutes, 0);
    const avgMinutes = Math.round(totalMinutes / Math.max(group.members.length, 1));

    document.getElementById('total-reading').innerText = formatTime(totalMinutes);
    document.getElementById('avg-reading').innerText = `เฉลี่ย ${formatTime(avgMinutes)} ต่อสมาชิก`;
    document.getElementById('member-count').innerText = `${group.members.length} คน`;
    document.getElementById('group-code').innerText = `รหัสกลุ่ม: ${group.joinCode}`;

    const rows = group.members
        .slice()
        .sort((a, b) => b.minutes - a.minutes)
        .map((member, idx) => `
            <div class="leader-row">
                <span class="rank">#${idx + 1}</span>
                <span class="name">${member.name}</span>
                <span class="time">${formatTime(member.minutes)}</span>
            </div>
        `)
        .join('');

    document.getElementById('leaderboard-rows').innerHTML = rows;
}

function openCreateGroupModal() {
    document.getElementById('create-group-modal').style.display = 'flex';
    document.getElementById('create-group-form').reset();
}

function closeCreateGroupModal() {
    document.getElementById('create-group-modal').style.display = 'none';
}

function openJoinGroupModal() {
    document.getElementById('join-group-modal').style.display = 'flex';
    document.getElementById('join-group-form').reset();
}

function closeJoinGroupModal() {
    document.getElementById('join-group-modal').style.display = 'none';
}

function openInviteModal() {
    const group = getSelectedGroup();
    if (!group) return;
    const link = `${window.location.origin}${window.location.pathname}?join=${encodeURIComponent(group.joinCode)}`;
    document.getElementById('invite-link').value = link;
    document.getElementById('invite-modal').style.display = 'flex';
}

function closeInviteModal() {
    document.getElementById('invite-modal').style.display = 'none';
}

function copyInviteLink() {
    const linkInput = document.getElementById('invite-link');
    navigator.clipboard.writeText(linkInput.value).then(() => {
        alert('คัดลอกลิงก์เรียบร้อยแล้ว');
    }).catch(() => {
        alert('ไม่สามารถคัดลอกลิงก์ได้ลองอีกครั้ง');
    });
}

function leaveGroup() {
    selectedGroupId = null;
    renderGroups();
    renderGroupDetails();
}

function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

window.addEventListener('load', () => {
    renderSidebar();
    renderGroups();
    renderGroupDetails();

    document.getElementById('search-groups').addEventListener('input', renderGroups);

    document.getElementById('create-group-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('group-name').value.trim();
        const desc = document.getElementById('group-desc').value.trim();
        const newGroup = {
            id: Date.now(),
            name,
            description: desc || 'ไม่มีคำอธิบาย',
            joinCode: generateJoinCode(),
            members: [{ name: currentUserName, minutes: 0 }]
        };
        groups.unshift(newGroup);
        selectedGroupId = newGroup.id;
        renderGroups();
        renderGroupDetails();
        closeCreateGroupModal();
    });

    document.getElementById('join-group-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('join-code').value.trim().toUpperCase();
        const name = document.getElementById('join-name').value.trim() || currentUserName;
        const group = groups.find(g => g.joinCode.toUpperCase() === code);
        if (!group) {
            alert('ไม่พบรหัสกลุ่มที่ระบุ');
            return;
        }
        const exists = group.members.find(m => m.name === name);
        if (!exists) {
            group.members.push({ name, minutes: 0 });
        }
        selectedGroupId = group.id;
        renderGroups();
        renderGroupDetails();
        closeJoinGroupModal();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const joinCodeParam = urlParams.get('join');
    if (joinCodeParam) {
        document.getElementById('join-code').value = joinCodeParam;
        openJoinGroupModal();
    }
});
