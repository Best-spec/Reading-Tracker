// --- Data Logic ---
const STORAGE_BOOKS_KEY = 'readflow_books';

function getSavedBooks() {
    try {
        const raw = localStorage.getItem(STORAGE_BOOKS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('ไม่สามารถอ่านข้อมูลหนังสือ', e);
        return null;
    }
}

function saveBooks(data) {
    localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(data));
}

let books = getSavedBooks();
if (!books || books.length === 0) {
    books = [
        { id: 1, title: "The Psychology of Money", author: "Morgan Housel", totalPages: 300, readPages: 150, cover: "https://images.unsplash.com/photo-1592492159418-39f319320569?w=200&h=300&fit=crop", readMinutes: 180 },
        { id: 2, title: "Deep Work", author: "Cal Newport", totalPages: 280, readPages: 238, cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=300&fit=crop", readMinutes: 220 }
    ];
    saveBooks(books);
}

// --- Sidebar ---
function renderSidebar() {
    const current = window.location.pathname.split('/').pop();
    const menu = [
        { icon: 'layout-dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'library', label: 'My Library', href: 'books.html' },
        { icon: 'bar-chart-2', label: 'Statistics', href: 'stats.html' },
        { icon: 'calendar', label: 'Calendar', href: 'calendar.html' },
        { icon: 'users', label: 'Groups', href: 'groups.html' },
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

// --- Render function ---
function renderBooks() {
    const grid = document.getElementById('books-grid');
    grid.innerHTML = books.map(book => {
        const progress = Math.round((book.readPages / book.totalPages) * 100);
        return `
            <div class="book-card">
                <div class="book-info-row">
                    <img src="${book.cover || 'https://via.placeholder.com/70x100?text=No+Cover'}" class="book-cover">
                    <div class="book-details">
                        <h3 title="${book.title}">${book.title}</h3>
                        <p>${book.author || 'ไม่ระบุผู้เขียน'}</p>
                    </div>
                </div>
                
                <div style="margin-top: 0.5rem;">
                    <div class="progress-stats">
                        <span>ความคืบหน้า</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <p style="font-size: 0.7rem; color: var(--text-muted); text-align: right;">
                        ${book.readPages} / ${book.totalPages} หน้า
                    </p>
                </div>

                <div class="card-actions">
                    <button class="btn btn-icon" onclick="editBook(${book.id})" title="แก้ไข">
                        <i data-lucide="edit-2" style="width:16px;"></i>
                    </button>
                    <button class="btn btn-icon btn-delete" onclick="deleteBook(${book.id})" title="ลบ">
                        <i data-lucide="trash-2" style="width:16px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// --- CRUD Operations ---
function openModal(bookId = null) {
    const modal = document.getElementById('book-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('book-form');
    form.reset();
    
    if (bookId) {
        const book = books.find(b => b.id === bookId);
        title.innerText = "แก้ไขข้อมูลหนังสือ";
        document.getElementById('edit-id').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('total-pages').value = book.totalPages;
        document.getElementById('read-pages').value = book.readPages;
        document.getElementById('cover-url').value = book.cover;
    } else {
        title.innerText = "เพิ่มหนังสือใหม่";
        document.getElementById('edit-id').value = "";
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

document.getElementById('book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        totalPages: parseInt(document.getElementById('total-pages').value),
        readPages: parseInt(document.getElementById('read-pages').value),
        cover: document.getElementById('cover-url').value
    };

    if (id) {
        // Update
        const index = books.findIndex(b => b.id == id);
        books[index] = { ...books[index], ...bookData };
    } else {
        // Add
        books.push({ id: Date.now(), ...bookData });
    }

    saveBooks(books);
    closeModal();
    renderBooks();
});

function editBook(id) {
    openModal(id);
}

function deleteBook(id) {
    if (confirm('จะลบหนังสือเล่มนี้จริงๆ เหรอ?')) {
        books = books.filter(b => b.id !== id);
        saveBooks(books);
        renderBooks();
    }
}

// --- Init ---
window.onload = () => {
    renderSidebar();
    renderBooks();
};
