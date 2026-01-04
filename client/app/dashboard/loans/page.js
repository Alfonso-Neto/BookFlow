'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '../../../lib/api';
import { Plus, Search, Calendar, User, Book, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../components/ToastProvider';

export default function LoansPage() {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ bookId: '', loanDate: '', returnDate: '' });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    const loadLoans = () => fetchAPI('/loans').then(setLoans).catch(console.error);
    const loadBooks = () => fetchAPI('/books').then(data => setBooks(data.filter(b => b.status === 'Available'))).catch(console.error);

    useEffect(() => {
        loadLoans();
    }, []);

    const handleNewLoanClick = () => {
        loadBooks();
        setFormData({ bookId: '', loanDate: new Date().toISOString().split('T')[0], returnDate: '' });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Return Date > Loan Date
        if (formData.returnDate && formData.returnDate <= formData.loanDate) {
            toast.error('A data de devolução deve ser posterior à data de empréstimo (pelo menos 1 dia).');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetchAPI('/loans', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            setShowForm(false);
            loadLoans();
            toast.success('Empréstimo registrado com sucesso!');
        } catch (error) {
            toast.error('Erro ao criar empréstimo: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (confirm('Confirmar devolução do livro?')) {
            try {
                await fetchAPI(`/loans/${id}/return`, { method: 'PUT' });
                loadLoans();
                toast.success('Livro devolvido com sucesso!');
            } catch (error) {
                toast.error('Erro ao devolver livro: ' + error.message);
            }
        }
    };

    const filteredLoans = loans.filter(loan => {
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Active' && loan.status === 'Active') ||
            (filterStatus === 'Returned' && loan.status !== 'Active');

        const loanDate = new Date(loan.loanDate);
        const start = filterDateStart ? new Date(filterDateStart) : null;
        const end = filterDateEnd ? new Date(filterDateEnd) : null;

        const matchesDate = (!start || loanDate >= start) && (!end || loanDate <= end);

        return matchesStatus && matchesDate;
    });

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-border dark:border-dark-border"
            >
                <div>
                    <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main">Meus Empréstimos</h2>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Gerencie seus empréstimos ativos e histórico</p>
                </div>
                <button onClick={handleNewLoanClick} className="btn bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-200 dark:shadow-none transition-all">
                    <Plus className="w-4 h-4" /> Novo Empréstimo
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-border dark:border-dark-border flex flex-wrap gap-4 items-end"
            >
                <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Status</label>
                    <select className="input-field py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="All">Todos</option>
                        <option value="Active">Ativos</option>
                        <option value="Returned">Finalizados</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">De</label>
                    <input type="date" className="input-field py-2" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Até</label>
                    <input type="date" className="input-field py-2" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                </div>
                <button
                    onClick={() => { setFilterStatus('All'); setFilterDateStart(''); setFilterDateEnd(''); }}
                    className="text-sm text-primary hover:text-primary-hover font-medium pb-2"
                >
                    Limpar Filtros
                </button>
            </motion.div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold mb-6 text-text-main dark:text-dark-text-main">Novo Empréstimo</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Livro</label>
                                    <select
                                        className="input-field"
                                        value={formData.bookId}
                                        onChange={e => setFormData({ ...formData, bookId: e.target.value })}
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="">Selecione um livro</option>
                                        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Data Empréstimo</label>
                                        <input type="date" className="input-field" value={formData.loanDate} onChange={e => setFormData({ ...formData, loanDate: e.target.value })} required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Data Devolução</label>
                                        <input type="date" className="input-field" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} required disabled={isLoading} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                                    <button type="button" onClick={() => setShowForm(false)} disabled={isLoading} className="px-4 py-2 text-text-secondary dark:text-dark-text-secondary hover:bg-background dark:hover:bg-dark-background rounded-lg transition-colors disabled:opacity-50">Cancelar</button>
                                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-md shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2">
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isLoading ? 'Processando...' : 'Registrar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden"
            >
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Detalhes do Empréstimo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Datas</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-dark-border">
                        {filteredLoans.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-text-secondary dark:text-dark-text-secondary">
                                    Nenhum empréstimo encontrado com os filtros selecionados.
                                </td>
                            </tr>
                        ) : (
                            filteredLoans.map((loan, i) => (
                                <motion.tr
                                    key={loan.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.05) }}
                                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-text-main dark:text-dark-text-main">{loan.userName || 'Unknown'}</div>
                                                <div className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                    <Book className="w-3 h-3" /> {loan.bookTitle || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm text-text-main dark:text-dark-text-main flex items-center gap-2">
                                                <span className="text-xs text-text-secondary dark:text-dark-text-secondary w-12">Início:</span>
                                                {new Date(loan.loanDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-text-main dark:text-dark-text-main flex items-center gap-2">
                                                <span className="text-xs text-text-secondary dark:text-dark-text-secondary w-12">Fim:</span>
                                                {new Date(loan.returnDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loan.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {loan.status === 'Active' ? 'Ativo' : 'Devolvido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {loan.status === 'Active' && (
                                            <button
                                                onClick={() => handleReturn(loan.id)}
                                                className="text-xs font-medium text-primary hover:text-primary-hover bg-primary-light dark:bg-primary/20 hover:bg-emerald-100 dark:hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Devolver
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
