/**
 * BookFlow Store
 * Handles data persistence and state management.
 */

const MOCK_DATA = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@bookflow.com', password: '123', role: 'admin' },
        { id: 2, name: 'John Doe', email: 'user@bookflow.com', password: '123', role: 'user' }
    ],
    books: [
        { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', year: 2008, isbn: '978-0132350884', status: 'Available' },
        { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Technology', year: 1999, isbn: '978-0201616224', status: 'Borrowed' },
        { id: 3, title: 'Design Patterns', author: 'Erich Gamma', category: 'Technology', year: 1994, isbn: '978-0201633610', status: 'Available' },
        { id: 4, title: 'Refactoring', author: 'Martin Fowler', category: 'Technology', year: 1999, isbn: '978-0201485677', status: 'Available' },
        { id: 5, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Education', year: 2009, isbn: '978-0262033848', status: 'Borrowed' }
    ],
    loans: [
        { id: 1, userId: 2, userName: 'John Doe', bookId: 2, bookTitle: 'The Pragmatic Programmer', loanDate: '2023-10-01', returnDate: '2023-10-15', status: 'Active' },
        { id: 2, userId: 2, userName: 'John Doe', bookId: 5, bookTitle: 'Introduction to Algorithms', loanDate: '2023-10-05', returnDate: '2023-10-20', status: 'Active' }
    ],
    currentUser: null
};

class Store {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('bookflow_data')) {
            localStorage.setItem('bookflow_data', JSON.stringify(MOCK_DATA));
        }
        this.state = JSON.parse(localStorage.getItem('bookflow_data'));
    }

    _save() {
        localStorage.setItem('bookflow_data', JSON.stringify(this.state));
    }

    // Auth
    login(email, password) {
        const user = this.state.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.state.currentUser = user;
            this._save();
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        this.state.currentUser = null;
        this._save();
    }

    getCurrentUser() {
        return this.state.currentUser;
    }

    // Books
    getBooks() {
        return this.state.books;
    }

    addBook(book) {
        book.id = Date.now();
        book.status = 'Available';
        this.state.books.push(book);
        this._save();
    }

    updateBook(updatedBook) {
        const index = this.state.books.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
            this.state.books[index] = { ...this.state.books[index], ...updatedBook };
            this._save();
        }
    }

    deleteBook(id) {
        this.state.books = this.state.books.filter(b => b.id !== id);
        this._save();
    }

    // Loans
    getLoans() {
        return this.state.loans;
    }

    addLoan(loan) {
        loan.id = Date.now();
        loan.status = 'Active';
        this.state.loans.push(loan);
        
        // Update book status
        const bookIndex = this.state.books.findIndex(b => b.id == loan.bookId);
        if (bookIndex !== -1) {
            this.state.books[bookIndex].status = 'Borrowed';
        }

        this._save();
    }

    returnLoan(id) {
        const loanIndex = this.state.loans.findIndex(l => l.id === id);
        if (loanIndex !== -1) {
            this.state.loans[loanIndex].status = 'Returned';
            this.state.loans[loanIndex].returnDate = new Date().toISOString().split('T')[0]; // Set actual return date

             // Update book status
             const bookId = this.state.loans[loanIndex].bookId;
             const bookIndex = this.state.books.findIndex(b => b.id == bookId);
             if (bookIndex !== -1) {
                 this.state.books[bookIndex].status = 'Available';
             }

            this._save();
        }
    }

    // Dashboard Stats
    getStats() {
        const totalBooks = this.state.books.length;
        const availableBooks = this.state.books.filter(b => b.status === 'Available').length;
        const borrowedBooks = this.state.books.filter(b => b.status === 'Borrowed').length;
        const activeLoans = this.state.loans.filter(l => l.status === 'Active').length;

        return { totalBooks, availableBooks, borrowedBooks, activeLoans };
    }
}

export const store = new Store();
