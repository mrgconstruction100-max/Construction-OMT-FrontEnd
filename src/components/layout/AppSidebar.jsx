import { 
  Building2, 
  Calendar, 
  CheckSquare, 
  Users, 
  UserCheck, 
  FileText, 
  BarChart3, 
  Settings,
  Home,
  Layers,
  ListTodo,
  UserPen,
  BadgeIndianRupee
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useEffect, useState } from "react";



export function AppSidebar() {
  const { state } = useSidebar();
  const { isMobile, setOpenMobile } = useSidebar();
  const {user} = useAuth();
  const {profileContext,setProfileContext} = useData();
  const [profile,setProfile] = useState(null);
  useEffect(()=>{
    setProfile(profileContext);
    
  },[profileContext]);
  const collapsed = state === "collapsed";
  let mainItems =[];
  let managementItems =[];
  if(user.role==="Admin"){

     mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: Building2 },
  { title: "Phases", url: "/phases", icon: Layers },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Incomes", url: "/incomes", icon: BadgeIndianRupee },
  { title: "Expenses", url: "/expenses", icon: ListTodo },
  
];
managementItems = [
  { title: "Members", url: "/members", icon: Users },
  { title: "Clients", url: "/clients", icon: UserCheck },
 //  { title: "Create New User", url: "/userList", icon: UserPen },
 { title: "Settings", url: "/settings", icon: Settings },
   
];

const reportItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
   { title: "Settings", url: "/settings", icon: Settings },
];
  }
  else{
   mainItems=[
     { title: "Dashboard", url: "/", icon: Home },
     { title: "Tasks", url: "/tasks", icon: CheckSquare },
      { title: "Expenses", url: "/expenses", icon: ListTodo },
   ] 
  }


  


  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar transition-smooth z-100 `}
      collapsible="icon"
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {profile?.image ? (
            <img
              src={profile?.image}
              alt="Business Logo"
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          {!collapsed && (
            
                <div>
              <h2 className="font-bold text-sidebar-foreground">{profile?.name}</h2>
               <p className="text-xs text-sidebar-foreground/70">Project Manager App</p> 
            </div>
            
            
          )}
        </div>
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
           
                     <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                 
                <NavLink to={item.url} end={item.url === "/"} onClick={() => { if (isMobile) setOpenMobile(false);}} >
                        {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className={`rounded-lg flex items-center gap-2 p-3 rounded-md cursor-pointer 
          hover:bg-orange-500 transition-colors  ${isActive ?"bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}>
                            <item.icon className="w-5 h-5" />
                            {!collapsed && <span className="ml-3">{item.title}</span>}
                        </SidebarMenuButton>
                        )}
                    </NavLink>
            
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
           
          </SidebarGroupContent>
        </SidebarGroup>
{managementItems.length>0 &&<>
<SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3 mt-6">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} end={item.url === "/"}  onClick={() => { if (isMobile) setOpenMobile(false);}} >
                        {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className={`rounded-lg flex items-center gap-2 p-3 rounded-md cursor-pointer 
          hover:bg-orange-500 transition-colors  ${isActive ?"bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}>
                            <item.icon className="w-5 h-5" />
                            {!collapsed && <span className="ml-3">{item.title}</span>}
                        </SidebarMenuButton>
                        )}
                    </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
</>}
        

        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3 mt-6">
            {!collapsed && "Analytics"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} end={item.url === "/"}  onClick={() => { if (isMobile) setOpenMobile(false);}} >
                        {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className={`rounded-lg flex items-center gap-2 p-3 rounded-md cursor-pointer 
          hover:bg-orange-500 transition-colors  ${isActive ?"bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}>
                            <item.icon className="w-5 h-5" />
                            {!collapsed && <span className="ml-3">{item.title}</span>}
                        </SidebarMenuButton>
                        )}
                    </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
    </Sidebar>
  );
}