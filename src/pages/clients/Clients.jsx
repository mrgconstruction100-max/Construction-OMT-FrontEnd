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
  Briefcase
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/Table/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import AddClients from "../../components/models/AddClients";
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
import API from "../../axios";
const clientsColumns =[
  //  {
  //   accessorKey: 'customId',
  //   header: 'Client ID',
  // },
  {
    accessorKey: 'name',
    header: 'Client Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  }
]
function Clients() {
  const [allClients,setAllClients] = useState([]); //All data
  const [clientsData, setClientsData]=useState([]); // Filtered Data
  const [editClient, setEditClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view,setView] = useState('card');
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const {clientContext,setClientContext,projectContext} = useData(); // get all Client data from data context (Initial fetch during login)
   const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, clientId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  const {user} = useAuth();


   useEffect(() => {
          fetchData();
          }, [clientContext]);

    const fetchData = async()=>{
      const client = await clientContext.sort((a,b)=>a.createdAt-b.createdAt)
      setClientsData(client);
      setAllClients(clientContext);
      setLoading(false);
      
    }
  const handleToggle = (newView) => {
      setView(newView);
    };

    const handleRowClick = (row) => {
        navigate(`/client/${row._id}`);
    };
     const handleEditClient = async(updated) => {
      try {
        setClientsData(prev =>
          prev.map((client) => client._id === updated._id ? updated : client)
        );
        setAllClients(prev =>
          prev.map((client) => client._id === updated._id ? updated : client)
        );
        setClientContext(prev =>
          prev.map((client) => client._id === updated._id ? updated : client)
        );
      setEditClient(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };


  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true,clientId: id })
  }
   //  Delete Member (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.clientId
       setConfirmDialog({ open: false,clientId: null })
       try{
          
          const filteredProjects = projectContext.filter((project) =>  String(project?.clientId?._id) === String(id));
          if(filteredProjects.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "Project is created for this client. You can't delete.",
                });
            return;
          }
         
          
            
            await API.delete(`/client/${id}`);
            setClientsData(prev => prev.filter(m => m._id !== id));
            setAllClients(prev => prev.filter(m => m._id !== id));
            setClientContext(prev => prev.filter(m => m._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Client deleted successfully.",
              });
        
            
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete client.",
            });
            
          }
     }

  const handleAddClient = async(client) => {
     try {
          //  const res = await API.put(`/client/${updated._id}`, updated);
        setClientsData(prev => [...prev, client]);
        setAllClients(prev => [...prev, client]);
        setClientContext(prev => [...prev, client]);
      setEditClient(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleEdit = (client) => {
    setEditClient({ ...client });
     setShowModal(true);
  };
  const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
};


  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

// Filter the member based on filter
  const applyFilters = (filters) => {
     if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
    setClientsData(allClients); // ✅ show all again
    setActiveFilters({}); // Clear active filters
    return;
  }
  let filtered = [...allClients];
  const newActiveFilters = {};
 
  if (filters.role) {
    filtered = filtered.filter(
      (p) => filters.role.includes(p.role)
    );
    newActiveFilters.role = filters.role;
  }

    setClientsData(filtered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters); // Also store the raw filter values
};


const clientsFilterConfig = {
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
    setClientsData(allClients);
    setActiveFilters({});
    setFilterValues({});
  };
  const unique = (arr) => [...new Set(arr.filter(Boolean))]; // Removes duplicates & empty
const locations = unique(allClients.map((m) => m?.role));
  return (
    <>
   
      
        {/* Header */}

        <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search clients..."
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
                  <Button onClick={() => setShowModal(true)}  mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" >
                    <Plus className="w-4 h-4 mr-2" />
                    New Client
                  </Button>
                  
                  {/* <Button
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button> */}
                </div>
              
          </div>

          <AddClients
              isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditClient(null);
            }}
            onSubmit={handleAddClient}
            onEdit={handleEditClient}
            editClient={editClient}
         />
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      {view === 'table' &&
        <div>
          {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              {/* <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={projectsFilterConfig}
                data-page-type="projects"
              /> */}

          <DataTable data={clientsData} columns={clientsColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
      }
        {/* Projects Grid */}
        {view === 'card' &&
        <>
        {/* Stats Cards */}
      
        {/* <div  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat,index)=>(
          <StatsCard key={index}
            title={stat.title}
            value={stat.count}
            description={stat.description}
            icon={<stat.icon className="w-5 h-5" />}
           
          />
        ))}
     
         
       </div> */}
          
        
        
      
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {clientsData.filter(client => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            client?.name?.toLowerCase().includes(search) ||
             client?._id?.toLowerCase().includes(search) ||
             client?.role?.toLowerCase().includes(search) 

          );
        }).map((client) => (

            <Card key={client?._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="AnonymousImage.jpg" alt={client?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(client?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg leading-6">{client?.name}</CardTitle>
                  
                </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    {/* <Button variant="ghost" size="sm" onClick={()=>navigate(`/phase/${phase._id}`)}>
                      <Eye className="w-4 h-4"  />
                    </Button>
                    <Button variant="ghost" size="sm"
                     onClick={() => handleEdit(phase)}>
                      <Edit className="w-4 h-4" />
                    </Button> */}
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(client._id)}  className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground break-all">{client?.personalEmail}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{client?.phone}</span>
                </div>

                {/* <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {client.activeProjects === 0 
                      ? "Not assigned to any projects" 
                      : `Working on ${client?.activeProjects} project${client?.activeProjects > 1 ? 's' : ''}`
                    }
                  </span>
                </div> */}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => navigate(`/client/${client._id}`)} variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button onClick={() => handleEdit(client)} variant="outline" size="sm" className="flex-1">
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
                          This action cannot be undone. Do you really want to delete this Client?
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
  )
}

export default Clients
