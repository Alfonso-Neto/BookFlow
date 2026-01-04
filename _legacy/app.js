import { store } from './store.js';

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    dashboard: document.getElementById('dashboard-view'),
    books: document.getElementById('books-view'),
    loans: document.getElementById('loans-view')
};

const mainLayout = document.getElementById('main-layout');
const loginForm = document.getElementById('login-form');
const navItems = document.querySelectorAll('.nav-item[data-target]');
const logoutBtn = document.getElementById('logout-btn');
const pageTitle = document.getElementById('page-title');
const userNameDisplay = document.getElementById('user-name');

// Book Elements
const booksTableBody = document.getElementById('books-table-body');
const addBookBtn = document.getElementById('add-book-btn');
const bookFormContainer = document.getElementById('book-form-container');
const bookForm = document.getElementById('book-form');
const cancelBookBtn = document.getElementById('cancel-book-btn');
const bookFormTitle = document.getElementById('book-form-title');

// Loan Elements
const loansTableBody = document.getElementById('loans-table-body');
const addLoanBtn = document.getElementById('add-loan-btn');
const loanFormContainer = document.getElementById('loan-form-container');
const loanForm = document.getElementById('loan-form');
const cancelLoanBtn = document.getElementById('cancel-loan-btn');
const loanBookSelect = document.getElementById('loan-book-select');
const loanUserSelect = document.getElementById('loan-user-select');

// State
let currentView = 'dashboard';

// --- Initialization ---

function init() {
    const user = store.getCurrentUser();
    if (user) {
        showMainLayout(user);
    } else {
        showLogin();
    }
}

// --- Navigation & Views ---

function showLogin() {
    views.login.classList.remove('hidden');
    mainLayout.classList.add('hidden');
}

function showMainLayout(user) {
    views.login.classList.add('hidden');
    mainLayout.classList.remove('hidden');
    userNameDisplay.textContent = user.name;
    navigateTo('dashboard');
}

function navigateTo(target) {
    // Update Sidebar
    navItems.forEach(item => {
        if (item.dataset.target === target) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Hide all views
    Object.values(views).forEach(view => {
        if (view !== views.login) view.classList.add('hidden');
    });

    // Show target view
    if (views[target]) {
        views[target].classList.remove('hidden');
    }

    currentView = target;
    pageTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1);

    // Refresh Data
    if (target === 'dashboard') renderDashboard();
    if (target === 'books') renderBooks();
    if (target === 'loans') renderLoans();
}

// --- Dashboard ---

function renderDashboard() {
    const stats = store.getStats();
    document.getElementById('stat-total').textContent = stats.totalBooks;
    document.getElementById('stat-available').textContent = stats.availableBooks;
    document.getElementById('stat-borrowed').textContent = stats.borrowedBooks;
    document.getElementById('stat-active').textContent = stats.activeLoans;
}

// --- Books Management ---

function renderBooks() {
    const books = store.getBooks();
    booksTableBody.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td><span class="status-badge ${book.status === 'Available' ? 'status-available' : 'status-borrowed'}">${book.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="window.editBook(${book.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteBook(${book.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.editBook = (id) => {
    const book = store.getBooks().find(b => b.id === id);
    if (!book) return;

    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-category').value = book.category;
    document.getElementById('book-year').value = book.year;
    document.getElementById('book-isbn').value = book.isbn;

    bookFormTitle.textContent = 'Editar Livro';
    bookFormContainer.classList.remove('hidden');
};

window.deleteBook = (id) => {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
        store.deleteBook(id);
        renderBooks();
    }
};

// --- Loans Management ---

function renderLoans() {
    const loans = store.getLoans();
    loansTableBody.innerHTML = loans.map(loan => `
        <tr>
            <td>${loan.userName}</td>
            <td>${loan.bookTitle}</td>
            <td>${formatDate(loan.loanDate)}</td>
            <td>${formatDate(loan.returnDate)}</td>
            <td><span class="status-badge ${loan.status === 'Active' ? 'status-active' : 'status-returned'}">${loan.status}</span></td>
            <td>
                ${loan.status === 'Active' ? `<button class="btn btn-sm btn-primary" onclick="window.returnLoan(${loan.id})">Devolver</button>` : '-'}
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

window.returnLoan = (id) => {
    if (confirm('Confirmar devolução do livro?')) {
        store.returnLoan(id);
        renderLoans();
    }
};

function populateLoanSelects() {
    const books = store.getBooks().filter(b => b.status === 'Available');
    const users = store.state.users; // Accessing state directly for simplicity in this mock

    loanBookSelect.innerHTML = '<option value="">Selecione um livro</option>' +
        books.map(b => `<option value="${b.id}">${b.title}</option>`).join('');

    loanUserSelect.innerHTML = '<option value="">Selecione um usuário</option>' +
        users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

// --- Event Listeners ---

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navigateTo(item.dataset.target);
    });
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = store.login(email, password);
    if (result.success) {
        showMainLayout(result.user);
    } else {
        alert(result.message);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    store.logout();
    showLogin();
});

// Book Form
addBookBtn.addEventListener('click', () => {
    bookForm.reset();
    document.getElementById('book-id').value = '';
    bookFormTitle.textContent = 'Novo Livro';
    bookFormContainer.classList.remove('hidden');
});

cancelBookBtn.addEventListener('click', () => {
    bookFormContainer.classList.add('hidden');
});

bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('book-id').value;
    const bookData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        category: document.getElementById('book-category').value,
        year: document.getElementById('book-year').value,
        isbn: document.getElementById('book-isbn').value
    };

    if (id) {
        store.updateBook({ id: parseInt(id), ...bookData });
    } else {
        store.addBook(bookData);
    }

    bookFormContainer.classList.add('hidden');
    renderBooks();
});

// Loan Form
addLoanBtn.addEventListener('click', () => {
    loanForm.reset();
    populateLoanSelects();
    loanFormContainer.classList.remove('hidden');
});

cancelLoanBtn.addEventListener('click', () => {
    loanFormContainer.classList.add('hidden');
});

loanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const bookId = loanBookSelect.value;
    const userId = loanUserSelect.value;

    if (!bookId || !userId) {
        alert('Selecione um livro e um usuário');
        return;
    }

    const book = store.getBooks().find(b => b.id == bookId);
    const user = store.state.users.find(u => u.id == userId);

    const loanData = {
        userId: parseInt(userId),
        userName: user.name,
        bookId: parseInt(bookId),
        bookTitle: book.title,
        loanDate: document.getElementById('loan-date').value,
        returnDate: document.getElementById('return-date').value
    };

    store.addLoan(loanData);
    loanFormContainer.classList.add('hidden');
    renderLoans();
});

// Start
init();
