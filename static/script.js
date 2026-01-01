const API_URL = '/api';

// Load books on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
});

// Add book form submission
document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

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
            showMessage('formMessage', 'Book added successfully!', 'success');
            document.getElementById('addBookForm').reset();
            loadBooks();
        } else {
            showMessage('formMessage', data.error || 'Failed to add book', 'error');
        }
    } catch (error) {
        showMessage('formMessage', 'Error connecting to server', 'error');
    }
});

// Load all books
async function loadBooks() {
    const container = document.getElementById('booksList');
    container.innerHTML = '<p class="loading">Loading books...</p>';

    try {
        const response = await fetch(`${API_URL}/books`);
        const data = await response.json();

        if (data.books && data.books.length > 0) {
            container.innerHTML = data.books.map(book => `
                <div class="book-item">
                    <div class="book-info">
                        <h3>${escapeHtml(book.title)}</h3>
                        <p>by ${escapeHtml(book.author)}</p>
                        <div class="details">
                            ${book.price ? `<span>$${book.price.toFixed(2)}</span>` : ''}
                            ${book.quantity ? `<span>Qty: ${book.quantity}</span>` : ''}
                            ${book.isbn ? `<span>ISBN: ${book.isbn}</span>` : ''}
                        </div>
                    </div>
                    <div class="book-actions">
                        <button class="btn-edit" onclick="openEditModal('${book._id}', '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', ${book.price || 0}, ${book.quantity || 0})">Edit</button>
                        <button class="btn-delete" onclick="deleteBook('${book._id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-books">No books yet. Add your first book above!</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="no-books">Could not load books. Is the server running?</p>';
    }
}

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadBooks();
        }
    } catch (error) {
        alert('Failed to delete book');
    }
}

// Edit modal functions
function openEditModal(id, title, author, price, quantity) {
    document.getElementById('editBookId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editAuthor').value = author;
    document.getElementById('editPrice').value = price;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editModal').classList.add('show');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('show');
}

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
            loadBooks();
        }
    } catch (error) {
        alert('Failed to update book');
    }
});

// Helper functions
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `message ${type}`;
    setTimeout(() => { el.className = 'message'; }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
