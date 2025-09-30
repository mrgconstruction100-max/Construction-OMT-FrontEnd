import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Outlet,useLocation } from 'react-router-dom';



export function AppLayout({ children }) {

    const location = useLocation();

            const staticTitles = {
        '/': 'Dashboard',
        '/members': 'Members',
        '/projects': 'Projects',
        '/tasks': 'Tasks',
        '/expenses': 'Expenses',
        '/incomes':'Incomes',
        '/settings': 'Settings',
        '/phases': 'Phases',
        '/reports': 'Reports',
        '/userList': 'User List',
        '/clients': 'Clients',
        '/profile':'Profile Settings'
        };

        const getPageTitle = () => {
        const path = location.pathname;
        if (staticTitles[path]) return staticTitles[path];
        if (path.startsWith('/member/')) return 'Member';
        if (path.startsWith('/project/')) return 'Project';
        if (path.startsWith('/task/')) return 'Task';
        if (path.startsWith('/phase/')) return 'Phase';
        if (path.startsWith('/income/')) return 'Income';
        if (path.startsWith('/expense/')) return 'Expense';
        if (path.startsWith('/client/')) return 'Client';
        
      
        return 'Dashboard';
        };
  return (
    <SidebarProvider>
       <div className="min-h-screen  flex w-full  bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col ">
         
          
          <main className="flex-1 overflow-visible">
               <AppHeader title={getPageTitle()}  />
            <div className="container-fluid mx-auto pb-4  ">
              <Outlet/>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}