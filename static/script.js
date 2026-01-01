const API_URL = '/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    initAnimations();
});

// Stagger animations for page elements
function initAnimations() {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
    });
}

// Add book form
document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('.btn-primary');
    btn.classList.add('loading');

    const book = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        price: parseFloat(document.getElementById('price').value) || 0,
        quantity: parseInt(document.getElementById('quantity').value) || 0
    };

    try {
        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Book added to your collection!');
            document.getElementById('addBookForm').reset();

            // Animate form inputs
            const inputs = document.querySelectorAll('#addBookForm input');
            inputs.forEach(input => {
                input.style.animation = 'none';
                input.offsetHeight; // Trigger reflow
                input.style.animation = 'inputSuccess 0.5s ease-out';
            });

            loadBooks();
        } else {
            showMessage('formMessage', data.error || 'Failed to add book', 'error');
        }
    } catch (error) {
        showMessage('formMessage', 'Error connecting to server', 'error');
    }

    btn.classList.remove('loading');
});

// Load all books  
async function loadBooks() {
    const container = document.getElementById('booksList');

    try {
        const response = await fetch(`${API_URL}/books`);
        const data = await response.json();

        // Update stats
        document.querySelector('.stat-number').textContent = data.total_books || 0;
        document.querySelector('.stat-number').classList.add('pulse');
        setTimeout(() => document.querySelector('.stat-number').classList.remove('pulse'), 500);

        if (data.books && data.books.length > 0) {
            container.innerHTML = data.books.map((book, index) => `
                <div class="book-card" style="animation-delay: ${index * 0.08}s">
                    <div class="book-info">
                        <h3>${escapeHtml(book.title)}</h3>
                        <p class="author">by ${escapeHtml(book.author)}</p>
                        <div class="book-meta">
                            ${book.price ? `<span class="meta-tag">$${book.price.toFixed(2)}</span>` : ''}
                            ${book.quantity ? `<span class="meta-tag">${book.quantity} in stock</span>` : ''}
                            ${book.isbn ? `<span class="meta-tag">${book.isbn}</span>` : ''}
                        </div>
                    </div>
                    <div class="book-actions">
                        <button class="btn-action btn-edit" onclick="openEditModal('${book._id}', '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', ${book.price || 0}, ${book.quantity || 0})" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteBook('${book._id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="no-books">
                    <svg class="no-books-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p>Your collection is empty</p>
                    <p style="font-size: 0.875rem; margin-top: 8px;">Add your first book above to get started!</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="no-books">
                <p>Could not connect to server</p>
                <p style="font-size: 0.875rem; margin-top: 8px;">Make sure the backend is running</p>
            </div>
        `;
    }
}

// Delete book with confirmation
async function deleteBook(id) {
    if (!confirm('Remove this book from your collection?')) return;

    try {
        const response = await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });

        if (response.ok) {
            // Animate removal
            const cards = document.querySelectorAll('.book-card');
            cards.forEach(card => {
                if (card.innerHTML.includes(id)) {
                    card.style.animation = 'cardSlideOut 0.3s ease-out forwards';
                }
            });

            setTimeout(() => {
                showToast('Book removed from collection');
                loadBooks();
            }, 300);
        }
    } catch (error) {
        showToast('Failed to delete book', true);
    }
}

// Modal functions
function openEditModal(id, title, author, price, quantity) {
    document.getElementById('editBookId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editAuthor').value = author;
    document.getElementById('editPrice').value = price;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('editModal').classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on backdrop click
document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') closeModal();
});

// Edit form submission
document.getElementById('editBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editBookId').value;
    const updates = {
        title: document.getElementById('editTitle').value,
        author: document.getElementById('editAuthor').value,
        price: parseFloat(document.getElementById('editPrice').value) || 0,
        quantity: parseInt(document.getElementById('editQuantity').value) || 0
    };

    try {
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            closeModal();
            showToast('Book updated successfully!');
            loadBooks();
        }
    } catch (error) {
        showToast('Failed to update book', true);
    }
});

// Toast notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;

    if (isError) {
        icon.style.color = 'var(--danger)';
    } else {
        icon.style.color = 'var(--success)';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Helper functions
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `message ${type}`;
    setTimeout(() => { el.className = 'message'; }, 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes cardSlideOut {
        to { opacity: 0; transform: translateX(100px) scale(0.9); }
    }
    @keyframes inputSuccess {
        0%, 100% { background: rgba(255, 255, 255, 0.05); }
        50% { background: rgba(0, 200, 83, 0.1); }
    }
    .pulse {
        animation: pulse 0.5s ease-out;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);
