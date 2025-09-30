import { Bell, Search, User, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


export function AppHeader({title}) {
    const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth scrolling
    });}

    const navigate = useNavigate();
    const {logout,user} = useAuth();
    
    

    const handleSignOut = async () => {

    try {
      await logout(); // remove user from context
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Something went wrong while logging out.");
    } 
  };
  return (
    <header className="h-16  border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50  ">
      <div className="h-full flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-smooth" />
          <div className="font-semibold text-lg">
             <button onClick={scrollToTop}>{title}</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user?.role}</p>
                  {/* <p className="text-xs text-muted-foreground">Project Manager</p> */}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {user?.role==="Admin"&&<>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=> navigate("/profile")}>Profile Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              </>
              }
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Log Out</DropdownMenuItem>
              </AlertDialogTrigger>

              {/* Dialog box */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Press Cancel to stay logged in.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>Yes, log out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}