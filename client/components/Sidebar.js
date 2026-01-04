'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Book, LogOut, Library, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => pathname === path;

    const NavItem = ({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
            <li>
                <Link
                    href={href}
                    className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
            ${active
                            ? 'bg-primary text-white shadow-md shadow-emerald-200 dark:shadow-none'
                            : 'text-text-secondary dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-surface hover:text-primary dark:hover:text-primary hover:shadow-sm'
                        }
          `}
                >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-text-secondary dark:text-dark-text-secondary group-hover:text-primary'}`} />
                    <span className="font-medium">{label}</span>
                </Link>
            </li>
        );
    };

    return (
        <nav className="w-[280px] bg-background dark:bg-dark-background h-screen flex flex-col border-r border-border dark:border-dark-border p-6 fixed left-0 top-0 z-50 transition-colors duration-300">
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                        <Library className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-text-main dark:text-dark-text-main tracking-tight">BookFlow</span>
                </div>
            </div>

            <ul className="flex flex-col gap-2 animate-slide-in-right">
                <NavItem href="/dashboard" icon={Home} label="Dashboard" />
                <NavItem href="/dashboard/books" icon={Book} label="Livros" />
                <NavItem href="/dashboard/loans" icon={BookOpen} label="Empréstimos" />
            </ul>

            <div className="mt-auto space-y-4">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-surface transition-all duration-200"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div className="pt-6 border-t border-border dark:border-dark-border">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-text-secondary dark:text-dark-text-secondary hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sair</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
