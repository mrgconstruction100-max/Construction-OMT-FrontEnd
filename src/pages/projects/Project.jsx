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
  User,
  ReceiptIndianRupee,
  Tags
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/Table/DataTable";
import AddProject from "@/components/models/AddProject";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import API from "@/axios";
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
import FilterComp from "../../components/filter/FilterComp";
import FilterStatus from "../../components/filter/FilterStatus";




export default function Projects() {
  const projectColumns =[
   {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="default"
            onClick={(e) => {
              e.stopPropagation(); // prevent row click navigation
              handleEdit(row.original); // pass whole row data
             
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original._id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
   {
    accessorKey: 'typeId',
    header: 'Project ID',
   
  },
  {
    accessorKey: 'name',
    header: 'Project title',
    
  },
    {
    accessorKey: 'clientId',
    header: 'Client',
     cell: info => {
      const member = info.getValue();
      return member?.name || 'N/A'; // ✅ Display member name instead of object
    },
  }, 
   {
    accessorKey: 'projectManager',
    header: 'Project Manager',
     cell: info => {
      const member = info.getValue();
      return member?.name || 'N/A'; // ✅ Display member name instead of object
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
  },
{
  accessorKey: 'endDate',
  header: 'End Date',
  cell: info => {
      const val = info.getValue();
      if (!val) return "N/A";
      const d = new Date(val);
      // Optionally check for invalid date if your backend can store "invalid" strings
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
},
 
  
  {
    accessorKey: 'status',
    header: 'Status',
  
    cell: info => {
      const status = info.getValue() ;
      const bgMap = {
        'Planning': '#f0ab2cff',
        'In Progress': '#3daae9ff',
        'Completed': '#1ef102ff',
        'On Hold': '#f72525ff',
        'Delayed': '#fa7000ff',
        'Cancelled': '#f72525ff'

      };
       return (
        <span
          style={{
            backgroundColor: bgMap[status] || '#e9ecef',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            display: 'inline-block'
          }}
        >
          {status.replace(/-/g, ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size:200,
   
    cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  },
]
  const [projects, setProjects] = useState([]); // displays data
  const [allProjects, setAllProjects] = useState([]); // ✅ store original data
  const {projectContext,setProjectContext,memberContext,phaseContext,taskContext,expenseContext,clientContext,incomeContext}= useData(); // get All project data from datacontext (Initial fetch during login)
  const [memberOptions,setMemberOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [view,setView] = useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditProject] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const {user} = useAuth();
  const navigate = useNavigate();
  const handleToggle = (newView) => {
      setView(newView);
    };

    useEffect(() => {

    const updatedProjects = projectContext.map((project) => {
    
       const projectTasks = taskContext.filter(
        (task) => String(task.projectId?._id) === String(project._id)
      );

      const completedTasks = projectTasks.filter(task=> String(task?.status)==="Completed");
      let progress=0;
       if (projectTasks.length > 0) {
          progress = (completedTasks.length / projectTasks.length) * 100;
        }

        // round to 1 decimal place
        progress = Number(progress.toFixed(1));
      const expenseProjects = expenseContext.filter(
        (expense) => String(expense.projectId?._id) === String(project._id)
      );
       const incomeProjects = incomeContext.filter(
        (income) => String(income.projectId?._id) === String(project._id)
      ); 
      const totalBudget = projectTasks.reduce(
        (sum, task) => sum + (task?.budget || 0),
        0
      );

      const spent = expenseProjects.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const revenue = incomeProjects.reduce(
        (sum, income) => sum + (income?.amount || 0),
        0
      );

      return {
        ...project,
        budget: totalBudget,
        spent,
        revenue,
        variance: totalBudget - spent,
        progress,
        pending:totalBudget-revenue,
      };
    });
    fetchOptions();
    setProjects(updatedProjects);
    setAllProjects(updatedProjects);
  
}, [projectContext, phaseContext, taskContext,memberContext,clientContext]);

    const fetchOptions = ()=>{
      setMemberOptions(memberContext.map(member=>({
        value:member._id,
        label:member.name,
      })
      ))
      setClientOptions(clientContext.map(client=>({
        value:client._id,
        label:client.name,
      })
      ))
    }
     // ✅ Add Project (Backend) +Local state
  const handleAddProject = async (projectData) => {
    try {
      const manager = memberOptions.find(m=> m.value === projectData.projectManager);
      const client = clientOptions.find(m=> m.value === projectData.clientId);
      const newProject = {
        ...projectData,
        projectManager:{_id:projectData.projectManager,name:manager?.label||""},
        clientId:{_id:projectData.clientId,name:client?.label||""}
      }
      setProjects(prev => [...prev, newProject]);
      setAllProjects(prev => [...prev, newProject]);
      setProjectContext(prev=>[...prev,newProject]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };
  // ✅ Update Project in front end for quick response
    const handleEditProject = async(updated) => {
       const manager = memberOptions.find(m=> m.value === updated.projectManager);
      const client = clientOptions.find(m=> m.value === updated.clientId);
      const updatedProject = {
        ...updated,
        projectManager:{_id:updated.projectManager,name:manager?.label||""},
        clientId:{_id:updated.clientId,name:client?.label||""}
      }
        setProjects(prev =>
          prev.map((project) => project._id === updated._id ? updatedProject : project)
        );
       setAllProjects(prev =>
          prev.map((project) => project._id === updated._id ? updatedProject : project)
        );
        setProjectContext(prev =>
          prev.map((project) => project._id === updated._id ?updatedProject : project)
        );
      setEditProject(null);
      setShowModal(false);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, projectId: id })
  }
   //  Delete Project (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.projectId
       setConfirmDialog({ open: false, projectId: null })
       try{
          
          const filteredPhases = phaseContext.filter((phase) => String(phase.projectId._id) === String(id) );
          if(filteredPhases.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This project is used for creating phases. You can't delete it.",
                });
            return;
          }
         
          
            
            await API.delete(`/project/${id}`);
            setProjects(projects.filter(project => project._id !== id));
            setAllProjects(allProjects.filter(project => project._id !== id));
            setProjectContext(projectContext.filter(project=> project._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Project deleted successfully.",
              });
            // alert("Project deleted successfully");
            
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete project.",
            });
            // alert("Failed to delete Project")
          }
     }

   //  Open Edit Modal
  const handleEdit = (project) => {
    setEditProject(project); // force new reference
    setShowModal(true);
  };
    const handleRowClick = (row) => {
        navigate(`/project/${row._id}`);
    };
  const formatDate = (dateString) => {
   if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  const getStatusColor = (status) => {
  switch (status) {
    case 'In Progress': return "bg-blue-500 text-white";
    case 'Delayed': return "bg-orange-500 text-white";
    case 'Completed': return "bg-green-500 text-white";
    case "Planning": return "bg-yellow-500 text-black";
    case 'On Hold': return "bg-red-500 text-white";
    case 'Cancelled': return "bg-red-600 text-white";
    default: return "bg-gray-300 text-black";
  }
};

  // Filter the project based on filter
  const applyFilters = (filters) => {
     if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
    setProjects(allProjects); // ✅ show all again
    setActiveFilters({}); // Clear active filters
    return;
  }
  let filtered = [...allProjects];
  const newActiveFilters = {};
 
  if (filters.status) {
    filtered = filtered.filter(
      (p) => p.status.toLowerCase() === filters.status.toLowerCase()
    );
    newActiveFilters.status = filters.status;
  }

  if (filters.startDate) {
     const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
    filtered = filtered.filter(
      (p) => new Date(p.startDate).setHours(0, 0, 0, 0) >= start
    );
    newActiveFilters.startDate = filters.startDate;
   
  }

  if (filters.endDate) {
     const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
    filtered = filtered.filter(
      (p) => new Date(p.startDate).setHours(0, 0, 0, 0) <= end
    );
    newActiveFilters.endDate = filters.endDate;
  }
  if (filters.location && filters.location.length > 0) {
    filtered = filtered.filter(
      (p) =>  filters.location.includes(p.location)
    );
    newActiveFilters.location = filters.location;
  }
  // ✅ Project Manager (multi-select by name)
  if (filters.projectManager && filters.projectManager.length > 0) {
    filtered = filtered.filter((p) =>
      filters.projectManager.includes(p?.projectManager?.name)
    );
    newActiveFilters.projectManager = filters.projectManager;
  }

  // ✅ Client (multi-select by name)
  if (filters.client && filters.client.length > 0) {
    filtered = filtered.filter((p) =>
      filters.client.includes(p?.clientId?.name)
    );
    newActiveFilters.client = filters.client;
  }


   setProjects(filtered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters); // Also store the raw filter values
};


const projectsFilterConfig = {
  labels: {
    startDate: 'Date From',
    endDate: 'Date To', 
    status: 'Status'
  },
  fieldTypes: {
    startDate: 'date',
    endDate: 'date',
    status: 'string'
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
    setProjects(allProjects);
    setActiveFilters({});
    setFilterValues({});
  };
  const unique = (arr) => [...new Set(arr.filter(Boolean))]; // Removes duplicates & empty
const locations = unique(allProjects.map((p) => p?.location));
  return (
    <>
   
      
        {/* Header */}
    
        <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search projects..."
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
                  <Button mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" onClick={() => setShowModal(true)} >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                  
                    <FilterComp  fields={[
                    { name: "startDate", label: "Date From", type: "startDate" },
                    { name: "endDate", label: "Date To", type: "endDate" },
                    { name: "status", label: "Status", type: "select", options: ["Planning", "In Progress", "Completed","On-Hold","Delayed","Cancelled"] },
                    { name: "location", label: "Location", type: "multiselect", options:locations },
                    { name: "projectManager", label: "Project Manager", type: "multiselect",options:memberOptions.map((m) => m.label) },
                    { name: "client", label: "Client", type: "multiselect",options:clientOptions.map((m) => m.label) },
                  ]}
                  onApplyFilters={(filters) => applyFilters(filters)}
                  initialValues={filterValues} />
                    
                 
                </div>
              
          </div>
          
<div className="space-y-6 px-6 w-full ">
     <div className="mt-16 space-y-6">
         <AddProject
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditProject(null);
        }}
        onSubmit={handleAddProject}
        onEdit={handleEditProject}
        editProject={editingProject}
      />
      {view === 'table' &&
      <>
      
       
          {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={projectsFilterConfig}
                data-page-type="projects"
              />
            <div >
          <DataTable data={projects} columns={projectColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
</div>

</>
      }
        {/* Projects Grid */}
        {view === 'card' &&
        <>
        <div>
              {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={projectsFilterConfig}
                data-page-type="projects"
              />
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {projects.filter(project => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            project.name?.toLowerCase().includes(search) ||
             project.typeId?.toLowerCase().includes(search)

          );
        }).map((project) => (
            <Card key={project._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {project.name}
                    </CardTitle>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button variant="ghost" size="sm" onClick={()=>navigate(`/project/${project._id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}
                    title="Edit project">
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                        
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(project._id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                       
                  
                  </div>
                </div>
                 
              </CardHeader>
           
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress}  mode="progress" className="h-2" />
                </div>

                {/* Project Details */}
                <div className="space-y-2 text-sm">
                     <div className="flex items-center gap-2 text-muted-foreground">
                    <Tags className="w-4 h-4" />
                    <span>Project Id:</span>
                    <span className="font-medium text-foreground"> {project?.typeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4"/>
                    <span>Project Manager:</span>
                    <span className="font-medium text-foreground"> {project?.projectManager?.name} </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Allocated Budget:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project.budget)} </span>
                  </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
             
                    <span>Client Payments:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project?.revenue)} </span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    
                    <span>Expenditure:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project?.spent)} </span>
                  </div>
                 
                      {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="font-medium">
                        {formatCurrency(project?.spent)} / {formatCurrency(project?.budget)}
                      </span>
                    </div>
                    <Progress spent={project?.spent} budget={project?.budget} mode="budget" className="h-2" />
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Budget Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(project?.variance)}</span>
                  </div>
                        {/*profit Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Return Ratio</span>
                      <span className="font-medium">
                        {formatCurrency(project?.spent)} / {formatCurrency(project?.revenue)}
                      </span>
                    </div>
                   
                     <Progress spent={project?.spent} budget={project?.revenue} mode="budget" className="h-2" />
                  </div>
                
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Pending from Clients:</span>
                    <span className="font-medium text-foreground">{formatCurrency(project?.pending)}</span>
                  </div>
                </div>

                {/* Client */}
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium text-sm">{project?.clientId?.name}</p>
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
                          This action cannot be undone. Do you really want to delete this project?
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