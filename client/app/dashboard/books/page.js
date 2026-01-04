'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '../../../lib/api';
import { Plus, Trash2, Search, Edit, Book as BookIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../components/ToastProvider';

export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id: null, title: '', author: '', category: '', year: '', isbn: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const loadBooks = () => fetchAPI('/books').then(setBooks).catch(console.error);

    useEffect(() => {
        loadBooks();
    }, []);

    const handleEdit = (book) => {
        setFormData(book);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...formData, year: parseInt(formData.year) };
            if (formData.id) {
                await fetchAPI(`/books/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchAPI('/books', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            setShowForm(false);
            setFormData({ id: null, title: '', author: '', category: '', year: '', isbn: '' });
            loadBooks();
            toast.success('Livro salvo com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar livro: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.')) {
            try {
                await fetchAPI(`/books/${id}`, { method: 'DELETE' });
                loadBooks();
                toast.success('Livro excluído com sucesso!');
            } catch (error) {
                toast.error('Erro ao excluir livro: ' + error.message);
            }
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-border dark:border-dark-border"
            >
                <div>
                    <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main">Biblioteca</h2>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Gerencie seu acervo de livros</p>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por título, autor..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-dark-text-main transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ id: null, title: '', author: '', category: '', year: '', isbn: '' });
                            setShowForm(!showForm);
                        }}
                        className="btn bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-200 dark:shadow-none transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Livro</span>
                    </button>
                </div>
            </motion.div>

            {/* Form Modal/Panel */}
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
                            className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl w-full max-w-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text-main dark:text-dark-text-main">{formData.id ? 'Editar Livro' : 'Adicionar Novo Livro'}</h3>
                                <button onClick={() => setShowForm(false)} className="text-text-secondary dark:text-dark-text-secondary hover:text-text-main dark:hover:text-dark-text-main">
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Título</label>
                                        <input className="input-field" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Ex: Clean Code" disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Autor</label>
                                        <input className="input-field" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} required placeholder="Ex: Robert C. Martin" disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Categoria</label>
                                        <input className="input-field" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required placeholder="Ex: Tecnologia" disabled={isLoading} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Ano</label>
                                            <input type="number" className="input-field" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required placeholder="2008" disabled={isLoading} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-main dark:text-dark-text-main">ISBN</label>
                                            <input className="input-field" value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} required placeholder="978-..." disabled={isLoading} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                                    <button type="button" onClick={() => setShowForm(false)} disabled={isLoading} className="px-4 py-2 text-text-secondary dark:text-dark-text-secondary hover:bg-background dark:hover:bg-dark-background rounded-lg transition-colors disabled:opacity-50">Cancelar</button>
                                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-md shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2">
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isLoading ? 'Salvando...' : 'Salvar Livro'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Books Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredBooks.map((book, index) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-border dark:border-dark-border hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-16 bg-background dark:bg-dark-background rounded-md flex items-center justify-center shadow-inner">
                                    <BookIcon className="text-text-secondary/30 dark:text-dark-text-secondary/30 w-6 h-6" />
                                </div>
                                <div className="relative">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${book.status === 'Available'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {book.status === 'Available' ? 'Disponível' : 'Emprestado'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-bold text-text-main dark:text-dark-text-main text-lg mb-1 truncate" title={book.title}>{book.title}</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-4">{book.author}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-dark-border mt-auto">
                                <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary bg-background dark:bg-dark-background px-2 py-1 rounded-md">
                                    {book.category}
                                </span>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(book)}
                                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary hover:bg-primary-light dark:hover:bg-primary/20 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
