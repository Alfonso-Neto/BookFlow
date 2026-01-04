'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '../../lib/api';
import { Book, CheckCircle, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, title, value, trend, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-border dark:border-dark-border hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-bold text-success bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" /> {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">{title}</h3>
                <p className="text-3xl font-bold text-text-main dark:text-dark-text-main">{value}</p>
            </div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        activeLoans: 0
    });
    const [recentBooks, setRecentBooks] = useState([]);

    useEffect(() => {
        Promise.all([
            fetchAPI('/stats'),
            fetchAPI('/books')
        ]).then(([statsData, booksData]) => {
            setStats(statsData);
            setRecentBooks(booksData.slice(0, 5));
        }).catch(console.error);
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Book} title="Total de Livros" value={stats.totalBooks} trend="+12%" index={0} />
                <StatCard icon={CheckCircle} title="Disponíveis" value={stats.availableBooks} index={1} />
                <StatCard icon={BookOpen} title="Emprestados" value={stats.borrowedBooks} index={2} />
                <StatCard icon={Clock} title="Empréstimos Ativos" value={stats.activeLoans} index={3} />
            </div>

            {/* Recent Books Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden"
            >
                <div className="p-6 border-b border-border dark:border-dark-border flex justify-between items-center">
                    <h3 className="text-lg font-bold text-text-main dark:text-dark-text-main">Livros Adicionados Recentemente</h3>
                    <button className="text-sm text-primary font-medium hover:text-primary-hover">Ver todos</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Título</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Autor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Adicionado em</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-dark-border">
                            {recentBooks.map((book, i) => (
                                <motion.tr
                                    key={book.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-text-main dark:text-dark-text-main">{book.title}</div>
                                        <div className="text-xs text-text-secondary dark:text-dark-text-secondary">{book.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-dark-text-secondary">{book.author}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.status === 'Available'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${book.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                                                }`}></span>
                                            {book.status === 'Available' ? 'Disponível' : 'Emprestado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-dark-text-secondary">
                                        {new Date(book.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
