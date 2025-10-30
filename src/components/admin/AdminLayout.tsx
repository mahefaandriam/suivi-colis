import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm">
            <SidebarTrigger />
            <div className='w-full flex justify-between'>
              <h1 className="text-lg font-semibold">Gestion des Livraisons</h1>
              {/* User Menu */}
              <div className="flex items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-300 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border ">
                      <User size={16} className="text-primary-600" />
                    </div>
                    <span className="hidden md:block">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 text-xs border-b text-gray-500">
                        Signed in as<br />
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={14} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
