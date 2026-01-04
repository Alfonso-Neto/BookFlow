require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Data Store for fallback
let MOCK_DB = {
    users: [
        { id: '1', email: 'admin@bookflow.com', password: '123', name: 'Admin User', role: 'admin' }
    ],
    books: [
        { id: '1', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', year: 2008, isbn: '978-0132350884', status: 'Available', created_at: new Date().toISOString() },
        { id: '2', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Technology', year: 1999, isbn: '978-0201616224', status: 'Available', created_at: new Date().toISOString() }
    ],
    loans: []
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // Fallback to Mock if no token (or handle as unauthenticated)
        // For this strict requirement, we should probably enforce auth for protected routes
        // But to keep hybrid (if needed), we can check.
        // Let's assume strict auth for API routes except login
        if (!supabase) return next(); // Allow mock mode if no supabase
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Check if Supabase keys are available
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_KEY;

    console.log(`[Server] Checking Env Vars: URL=${hasUrl}, KEY=${hasKey}`);

    if (!hasUrl || !hasKey) {
        console.warn('⚠️  Missing Supabase keys in middleware. Skipping auth verification (Mock Mode).');
        return next();
    }

    // Create a scoped client for this request
    const scopedSupabase = require('@supabase/supabase-js').createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
            global: {
                headers: { Authorization: `Bearer ${token}` },
            },
        }
    );

    // Verify token by getting user
    const { data: { user }, error } = await scopedSupabase.auth.getUser();

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.supabase = scopedSupabase; // Use this client for RLS
    next();
};

// Apply middleware to protected routes
app.use('/api/books', authMiddleware);
app.use('/api/loans', authMiddleware);
app.use('/api/stats', authMiddleware);
app.use('/api/users', authMiddleware);

// --- Routes ---

// 1. Login (Handled by Frontend Supabase Auth, but we might keep this for legacy or admin)
// We can deprecate this or keep it for the mock mode.
app.post('/api/login', async (req, res) => {
    // ... existing login logic ...
    res.json({ success: true, message: 'Use Frontend Auth' });
});

// 2. Books
app.get('/api/books', async (req, res) => {
    const db = req.supabase || supabase;
    if (!db) return res.json(MOCK_DB.books);

    const { data, error } = await db.from('books').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/books', async (req, res) => {
    const { title, author, category, year, isbn } = req.body;
    const db = req.supabase || supabase;

    if (!db) {
        // ... mock logic ...
        const newBook = { id: Date.now().toString(), title, author, category, year, isbn, status: 'Available', created_at: new Date().toISOString() };
        MOCK_DB.books.unshift(newBook);
        return res.json(newBook);
    }

    const { data, error } = await db
        .from('books')
        .insert([{ title, author, category, year, isbn, status: 'Available' }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});
// ... (Apply similar pattern to other routes, replacing 'supabase' with 'req.supabase || supabase')

app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = req.supabase || supabase;

    if (!db) {
        const index = MOCK_DB.books.findIndex(b => b.id === id);
        if (index !== -1) {
            MOCK_DB.books[index] = { ...MOCK_DB.books[index], ...updates };
            return res.json(MOCK_DB.books[index]);
        }
        return res.status(404).json({ error: 'Book not found' });
    }

    const { data, error } = await db
        .from('books')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.supabase || supabase;

    if (!db) {
        MOCK_DB.books = MOCK_DB.books.filter(b => b.id !== id);
        return res.json({ success: true });
    }

    const { error } = await db.from('books').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// 3. Loans
app.get('/api/loans', async (req, res) => {
    const db = req.supabase || supabase;
    if (!db) {
        return res.json(MOCK_DB.loans);
    }

    // Join profiles (instead of users) and books
    const { data, error } = await db
        .from('loans')
        .select(`
            id,
            loan_date,
            return_date,
            status,
            profiles (name),
            books (title)
        `)
        .order('loan_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Flatten structure for frontend
    const formatted = data.map(loan => ({
        id: loan.id,
        userName: loan.profiles?.name || 'Unknown',
        bookTitle: loan.books?.title,
        loanDate: loan.loan_date,
        returnDate: loan.return_date,
        status: loan.status
    }));

    res.json(formatted);
});

app.post('/api/loans', async (req, res) => {
    const { bookId, loanDate, returnDate } = req.body;
    const db = req.supabase || supabase;
    const userId = req.user ? req.user.id : 'mock-user-id'; // Use authenticated user ID

    if (!db) {
        // Mock Mode
        const bookIndex = MOCK_DB.books.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });
        if (MOCK_DB.books[bookIndex].status === 'Borrowed') {
            return res.status(400).json({ error: 'Book is already borrowed' });
        }

        const newLoan = {
            id: Date.now().toString(),
            user_id: userId,
            book_id: bookId,
            loan_date: loanDate,
            return_date: returnDate,
            status: 'Active',
            users: { name: 'Admin User' }, // Mock user join
            books: { title: MOCK_DB.books[bookIndex].title } // Mock book join
        };

        MOCK_DB.loans.unshift(newLoan);
        MOCK_DB.books[bookIndex].status = 'Borrowed';

        return res.json(newLoan);
    }

    // Real Supabase Mode
    // 1. Check if book is available
    const { data: book, error: bookError } = await db
        .from('books')
        .select('status')
        .eq('id', bookId)
        .single();

    if (bookError || !book) return res.status(404).json({ error: 'Book not found' });
    if (book.status === 'Borrowed') return res.status(400).json({ error: 'Book is already borrowed' });

    // 2. Create Loan (RLS will ensure user_id is set if using default, but we can pass it explicitly too)
    // Note: If RLS is set to 'insert with check (auth.uid() = user_id)', we MUST send user_id matching the token.
    const { data: loan, error: loanError } = await db
        .from('loans')
        .insert([{ user_id: userId, book_id: bookId, loan_date: loanDate, return_date: returnDate, status: 'Active' }])
        .select();

    if (loanError) return res.status(500).json({ error: loanError.message });

    // 3. Update Book Status
    await db.from('books').update({ status: 'Borrowed' }).eq('id', bookId);

    res.json(loan[0]);
});

app.put('/api/loans/:id/return', async (req, res) => {
    const { id } = req.params;
    const db = req.supabase || supabase;

    if (!db) {
        // Mock Mode
        const loanIndex = MOCK_DB.loans.findIndex(l => l.id === id);
        if (loanIndex === -1) return res.status(404).json({ error: 'Loan not found' });

        const loan = MOCK_DB.loans[loanIndex];
        loan.status = 'Returned';
        loan.return_date = new Date().toISOString();

        const bookIndex = MOCK_DB.books.findIndex(b => b.id === loan.book_id);
        if (bookIndex !== -1) {
            MOCK_DB.books[bookIndex].status = 'Available';
        }

        return res.json({ success: true });
    }

    // Real Supabase Mode
    // 1. Get Loan to find Book ID
    const { data: loan } = await db.from('loans').select('book_id').eq('id', id).single();
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // 2. Update Loan Status
    const { error: updateError } = await db
        .from('loans')
        .update({ status: 'Returned', return_date: new Date().toISOString() })
        .eq('id', id);

    if (updateError) return res.status(500).json({ error: updateError.message });

    // 3. Update Book Status
    await db.from('books').update({ status: 'Available' }).eq('id', loan.book_id);

    res.json({ success: true });
});

// 4. Stats
app.get('/api/stats', async (req, res) => {
    const db = req.supabase || supabase;
    if (!db) {
        return res.json({
            totalBooks: MOCK_DB.books.length,
            availableBooks: MOCK_DB.books.filter(b => b.status === 'Available').length,
            borrowedBooks: MOCK_DB.books.filter(b => b.status === 'Borrowed').length,
            activeLoans: MOCK_DB.loans.filter(l => l.status === 'Active').length
        });
    }

    const { count: totalBooks } = await db.from('books').select('*', { count: 'exact', head: true });
    const { count: availableBooks } = await db.from('books').select('*', { count: 'exact', head: true }).eq('status', 'Available');
    const { count: borrowedBooks } = await db.from('books').select('*', { count: 'exact', head: true }).eq('status', 'Borrowed');
    const { count: activeLoans } = await db.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'Active');
    const { count: completedLoans } = await db.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'Returned');

    res.json({
        totalBooks: totalBooks || 0,
        availableBooks: availableBooks || 0,
        borrowedBooks: borrowedBooks || 0,
        activeLoans: activeLoans || 0,
        completedLoans: completedLoans || 0
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
