import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[280px] p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-main">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            A
                        </div>
                        <span className="font-medium text-text-main">Admin User</span>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
