import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Building2,
  CheckSquare,
  AlertTriangle,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Tag
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/Table/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import AddMember from "@/components/models/AddMember";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import API from "../../axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import FilterStatus from "../../components/filter/FilterStatus";
import FilterComp from "../../components/filter/FilterComp";

const membersColumns =[
  //  {
  //   accessorKey: 'customId',
  //   header: 'Member ID',
  // },
  {
    accessorKey: 'name',
    header: 'Member Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'personalEmail',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  // {
  //   accessorKey: 'maritalStatus',
  //   header: 'Marital Status',
  // },
  // {
  //   accessorKey: 'dateOfBirth',
  //   header: 'Date of Birth',
  //   cell: info => new Date(info.getValue()).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   }),
  // }
]



export default function Members() {
   const [allMembers,setAllMembers] = useState([]); //All data
    const [membersData, setMembersData]=useState([]); // Filtered Data
  const [editMember, setEditMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view,setView] = useState('card');
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const {memberContext,setMemberContext,taskContext} = useData(); // get all Member data from data context (Initial fetch during login)
   const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, memberId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  const {user} = useAuth();
   const [workingMembers, setWorkingMembers] = useState(0); 
   useEffect(() => {
          fetchData();
         
          }, [memberContext,taskContext]);

const fetchData = async () => {
  const sortedMembers = [...memberContext].sort((a, b) => a.customId - b.customId);

  const membersWithProjects = sortedMembers.map((member) => {
    const projectCount = taskContext.filter((task) =>
      task.assignedTo?.some((m) => String(m._id) === String(member._id))
    ).length;

    return {
      ...member,
      activeProjects: projectCount
    };
  });

  const activeCount = membersWithProjects.filter((m) => m.activeProjects > 0).length;

  setWorkingMembers(activeCount);
  setMembersData(membersWithProjects);    // <-- corrected line
  setAllMembers(membersWithProjects);     // <-- corrected line
  setLoading(false);
};

  const handleToggle = (newView) => {
      setView(newView);
    };

    const handleRowClick = (row) => {
        navigate(`/member/${row._id}`);
    };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEditMember = async(updated) => {
      try {
        setMembersData(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
        setAllMembers(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
        setMemberContext(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
      setEditMember(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

   const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, memberId: id })
  }
   //  Delete Member (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.memberId
       setConfirmDialog({ open: false, memberId: null })
       try{
          const filteredProjects = projectContext.filter((project) => String(project.projectManager._id) === String(id) );
          const filteredTasks = taskContext.filter((task) => task.assignedTo.some((member) => String(member._id) === String(id)) );
          if(filteredProjects.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "He is working in Project. You can't delete him.",
                });
            return;
          }
          if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "He is working in tasks. You can't delete him.",
                });
            return;
          }
         
          
            
            await API.delete(`/member/${id}`);
            setMembersData(prev => prev.filter(m => m._id !== id));
            setAllMembers(prev => prev.filter(m => m._id !== id));
            setMemberContext(prev => prev.filter(m => m._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Member deleted successfully.",
              });
        
            
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete member.",
            });
            
          }
     }


  const handleAddMember = async(member) => {
     try {
          
        setMembersData(prev => [...prev, member]);
        setAllMembers(prev => [...prev, member]);
        setMemberContext(prev => [...prev, member]);
     
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleEdit = (member) => {
    setEditMember({ ...member });
     setShowModal(true);
  };

const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
};
const getRoleColor = (role) => {
    switch (role) {
      case "Project Manager":
        return "default"
      case "Engineer":
        return "secondary"
      case "Site Engineer":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
 const stats = [
      ...(user?.role==='Admin'?[ { title: 'Total Members',description:'', count:allMembers.length, icon: Users },
        { title: 'Active Members',description:`Out of ${allMembers.length} total members`, count:workingMembers, icon: UserCheck, color: '#45B7D1',link:"/projects" },
     ]:[]),
    
    // { title: user?.role==="Admin"?'Total Subtasks':"Total Tasks Assigned to you", count:subTasks.length, icon: List, color: '#DDA0DD',link:"/subtasks" },
    // {title:'Total Assign For',count:assignFor.length,icon:UserCheck,color:'#f77272ff',link:"/assignFor"},
    
  ];
 // Filter the member based on filter
  const applyFilters = (filters) => {
     if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
    setMembersData(allMembers); // ✅ show all again
    setActiveFilters({}); // Clear active filters
    return;
  }
  let filtered = [...allMembers];
  const newActiveFilters = {};
 
  if (filters.role) {
    filtered = filtered.filter(
      (p) => filters.role.includes(p.role)
    );
    newActiveFilters.role = filters.role;
  }

    setMembersData(filtered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters); // Also store the raw filter values
};


const membersFilterConfig = {
  labels: { 
   role: 'Role'
  },
  fieldTypes: {
    role: 'string'
  },
};
 const clearFilter = (filterKey) => {
    const newActiveFilters = { ...activeFilters };
    const newFilterValues = { ...filterValues };
    
    delete newActiveFilters[filterKey];
    delete newFilterValues[filterKey];
    
    setActiveFilters(newActiveFilters);
    setFilterValues(newFilterValues);
    
    applyFilters(newFilterValues);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setMembersData(allMembers);
    setActiveFilters({});
    setFilterValues({});
  };
  const unique = (arr) => [...new Set(arr.filter(Boolean))]; // Removes duplicates & empty
const role = unique(allMembers.map((m) => m?.role));
  return (
    <>
   
      
        {/* Header */}

        <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search members..."
                      value={globalFilter || ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10 bg-accent w-full"
                    />
                  </div>
                </div>
                

                
                <div className="flex items-center gap-3 ">
                  <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
                </div>

                
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowModal(true)} mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" >
                    <Plus className="w-4 h-4 mr-2" />
                    New Member
                  </Button>
                  
                   <FilterComp  fields={[
                    // { name: "status", label: "Status", type: "select", options: ["Planning", "In Progress", "Completed","On-Hold","Delayed","Cancelled"] },
                    { name: "role", label: "Role", type: "multiselect", options:role },
                    // { name: "projectManager", label: "Project Manager", type: "multiselect",options:memberOptions.map((m) => m.label) },
                    // { name: "client", label: "Client", type: "multiselect",options:clientOptions.map((m) => m.label) },
                  ]}
                  onApplyFilters={(filters) => applyFilters(filters)}
                  initialValues={filterValues} />
                </div>
              
          </div>
          <AddMember
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMember(null);
        }}
        onSubmit={handleAddMember}
        onEdit={handleEditMember}
        editMember={editMember}
      />
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      {view === 'table' &&
        <div>
          {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={membersFilterConfig}
                data-page-type="member"
              />

          <DataTable data={membersData} columns={membersColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
      }
        {/* Projects Grid */}
        {view === 'card' &&
        <>
         {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={membersFilterConfig}
                data-page-type="member"
              />
        {/* Stats Cards */}
      
        <div  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat,index)=>(
          <StatsCard key={index}
            title={stat.title}
            value={stat.count}
            description={stat.description}
            icon={<stat.icon className="w-5 h-5" />}
           
          />
        ))}
     
         
       </div>
          
        
        
      
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {membersData.filter(member => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            member?.name?.toLowerCase().includes(search) ||
             member?._id?.toLowerCase().includes(search) ||
             member?.role?.toLowerCase().includes(search) 

          );
        }).map((member) => (

            <Card key={member?._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="AnonymousImage.jpg" alt={member?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(member?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg leading-6">{member?.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleColor(member?.role)}>
                      {member?.role}
                    </Badge>
                    {member.activeProjects > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {member?.activeProjects} active
                      </Badge>
                    )}
                  </div>
                </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                  
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(member._id)}  className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3 text-sm">
                 {/* <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground break-all">{member?.customId}</span>
                </div> */}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground break-all">{member?.personalEmail}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{member?.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {member.activeProjects === 0 
                      ? "Not assigned to any tasks" 
                      : `Working on ${member?.activeProjects} task${member?.activeProjects > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button  onClick={() => navigate(`/member/${member._id}`)} variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button onClick={() => handleEdit(member)}  variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
          </>
}
{/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this member?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Yes, Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Info Dialog (Success / Error) */}
                  <Dialog open={infoDialog.open} onOpenChange={(open) => setInfoDialog({ ...infoDialog, open })}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{infoDialog.type === "error" ? "Error" : "Success"}</DialogTitle>
                        <DialogDescription>{infoDialog.message}</DialogDescription>
                      </DialogHeader>
                      <Button onClick={() => setInfoDialog({ ...infoDialog, open: false })}>OK</Button>
                    </DialogContent>
                  </Dialog>
  
</div>  

      </div>
     </>
  );
}
