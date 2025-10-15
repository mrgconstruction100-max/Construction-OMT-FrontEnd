import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {   Plus,   Search,   Filter,   Calendar,   Users,   DollarSign,  Edit,  Trash2,Eye, ReceiptIndianRupee, Tags,} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/Table/DataTable";
import AddPhases from "@/components/models/AddPhases";
import { useData } from "@/context/DataContext";
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



export default function Phases() {
  const phasesColumns =[
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
    header: 'Phase ID',
  },
  {
    accessorKey: 'name',
    header: 'Phase title',
  },
   {
    accessorKey: 'projectId',
    header: 'Project',
     cell: info => {
      const project = info.getValue();
      return project?.name || 'N/A'; // ✅ Display project name instead of object
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
    cell: info =>
      { const val = info.getValue();
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
        'Waiting for Approval': '#fa6e11ff'
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
    accessorKey: 'description',
    header: 'Description',
    cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  },
]

  const[phases,setPhases] = useState([]); //Displays phase data in frontend
  const [allPhases,setAllPhases] = useState([]); //Stores original data from  data context
  const {phaseContext,setPhaseContext,projectContext,taskContext,expenseContext,incomeContext} = useData(); // get all data from initial
  const [projectOptions,setProjectOptions] = useState([]);
  const [view,setView] = useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPhase, setEditPhase] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, phaseId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  const handleToggle = (newView) => {
      setView(newView);
    };

     const fetchProject = ()=>{
      setProjectOptions(projectContext.map(project=>({
        value:project._id,
        label:project.name,
      })
      ))
    }

    useEffect(() => {

    const updatedPhases = phaseContext.map((phase) => {
      const phaseTasks = taskContext.filter(
        (task) => String(task.phaseId?._id) === String(phase._id)
      );

      const phaseProject = projectContext.filter(
        (project)=>String(phase.projectId?._id)===String(project._id)
      );
      const completedTasks = phaseTasks.filter(task=> String(task?.status)==="Completed");
      let progress=0;
       if (phaseTasks.length > 0) {
          progress = (completedTasks.length / phaseTasks.length) * 100;
        }

        // round to 1 decimal place
        progress = Number(progress.toFixed(1));
      const expensePhases = expenseContext.filter(
        (expense) => String(expense.phaseId?._id) === String(phase._id)
      );
  
      // const totalBudget = phaseTasks.reduce(
      //   (sum, task) => sum + (task?.budget || 0),
      //   0
      // );

      const spent = expensePhases.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const client = phaseProject?.[0]?.clientId?.name || 'N/A';

     
      return {
        ...phase,
        // budget: totalBudget,
        spent,
       
        variance: phase?.budget - spent,
       
        progress,
        client,
      
      };
    });

    setPhases(updatedPhases);
    setAllPhases(updatedPhases);
    fetchProject();
  }
, [phaseContext, taskContext,expenseContext]);

      const handleAddPhase = async (phaseData) => {
    try {
      const project = projectOptions.find(p=>p.value ===phaseData.projectId);

      const newPhase = {
        ...phaseData,
        projectId:{_id:phaseData?.projectId,name:project?.label || ''}
      }
      setPhases(prev => [...prev, newPhase]);
      setAllPhases(prev => [...prev, newPhase]);
      setPhaseContext(prev=>[...prev,newPhase]);
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };
  // ✅ Update Phase in front end for quick response
    const handleEditPhase = async(updated) => {
        const project = projectOptions.find(p=>p.value === updated.projectId);

        const updatedPhase ={
          ...updated,
          projectId:{_id:updated?.projectId, name:project?.label ||''}
        }
        setPhases(prev =>
          prev.map((phase) => phase._id === updated._id ? updatedPhase : phase)
        );
       setAllPhases(prev =>
          prev.map((phase) => phase._id === updated._id ? updatedPhase : phase)
        );
        setPhaseContext(prev =>
          prev.map((phase) => phase._id === updated._id ? updatedPhase : phase)
        );
      setEditPhase(null);
      setShowModal(false);
  };

   //  Open Edit Modal
  const handleEdit = (phase) => {
    setEditPhase(phase); // force new reference
    setShowModal(true);
  };


  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, phaseId: id })
  }


   //  Delete Phase (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.phaseId
       setConfirmDialog({ open: false, phaseId: null })
       try{
          
          const filteredTasks = taskContext.filter((task) => String(task.phaseId._id) === String(id) );
           const filteredExpense = expenseContext.filter((expense) => String(expense.phaseId._id) === String(id) );
          if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Phase is used for creating tasks. You can't delete it.",
                });
            return;
          }
          if(filteredExpense.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Phase contains expense. You can't delete it.",
                });
            return;
          }
         
           await API.delete(`/phase/${id}`);
            setPhases(phases.filter(phase => phase._id !== id));
            setAllPhases(allPhases.filter(phase => phase._id !== id));
            setPhaseContext(phaseContext.filter(phase=> phase._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Phase deleted successfully.",
              });         
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete phase.",
            });
            
          }
     }

    const handleRowClick = (row) => {
        navigate(`/phase/${row._id}`);
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
    case "In Progress":
      return "bg-blue-500 text-white";
    case "Waiting for Approval":
      return "bg-orange-500 text-white";
    case "Completed":
      return "bg-green-500 text-white";
    case "Planning":
      return "bg-yellow-500 text-black";
    case "On Hold":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-300 text-black";
  }
};
// Filter the Phase based on filter
  const applyFilters = (filters) => {
     if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
    setPhases(allPhases); // ✅ show all again
    setActiveFilters({}); // Clear active filters
    return;
  }
  let filtered = [...allPhases];
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
  // ✅ Project  (multi-select by name)
  if (filters.project && filters.project.length > 0) {
    filtered = filtered.filter((p) =>
      filters.project.includes(p?.projectId?.name)
    );
    newActiveFilters.project = filters.project;
  }

 


   setPhases(filtered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters); // Also store the raw filter values
};


const phaseFilterConfig = {
  labels: {
    startDate: 'Date From',
    endDate: 'Date To', 
    status: 'Status'
  },
  fieldTypes: {
    startDate: 'date',
    endDate: 'date',
    priority: 'string',
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
    setPhases(allPhases);
    setActiveFilters({});
    setFilterValues({});
  };

  return (
    <>
   
      
        {/* Header */}

        <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search phases..."
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
                    New Phases
                  </Button>
                  
                 <FilterComp  fields={[
                    { name: "startDate", label: "Date From", type: "startDate" },
                    { name: "endDate", label: "Date To", type: "endDate" },
                    { name: "status", label: "Status", type: "select", options: ["Planning", "In Progress", "Completed","On-Hold","Delayed","Cancelled"] },
                    { name: "project", label: "Project", type: "multiselect", options:projectOptions.map((m) => m.label) },
                    
                  ]}
                  onApplyFilters={(filters) => applyFilters(filters)}
                  initialValues={filterValues} />
                </div>
              
          </div>
           <AddPhases
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditPhase(null);
        }}
        onSubmit={handleAddPhase}
        onEdit={handleEditPhase}
        editPhase={editingPhase}
      />
         
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      {view === 'table' &&
      <>
       {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={phaseFilterConfig}
                data-page-type="phases"
              />
     
        <div>
     

          <DataTable data={phases} columns={phasesColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
         </>
      }
        {/* Phases Grid */}
        {view === 'card' &&
        <>
         {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={phaseFilterConfig}
                data-page-type="phases"
              />
       
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {phases.filter(phase => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            phase?.name?.toLowerCase().includes(search) ||
             phase?.typeId?.toLowerCase().includes(search)

          );
        }).map((phase) => (
            <Card key={phase?._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {phase?.name}
                    </CardTitle>
                    <Badge variant="secondary" className={getStatusColor(phase?.status)}>
                      {phase?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button variant="ghost" size="sm" onClick={()=>navigate(`/phase/${phase._id}`)}>
                      <Eye className="w-4 h-4"  />
                    </Button>
                    <Button variant="ghost" size="sm"
                     onClick={() => handleEdit(phase)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(phase._id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {phase?.description}
                </p>
               

                {/* Progress */}
                <div className="space-y-2">
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{phase?.progress}%</span>
                  </div>
                  <Progress value={phase?.progress} mode="progress" className="h-2" />
                </div>

                {/* Phase Details */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                    <Tags className="w-4 h-4" />
                    <span>Phase Id:</span>
                    <span className="font-medium text-foreground"> {phase?.typeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">{formatDate(phase?.startDate)} - {formatDate(phase?.endDate)}</span>
                  </div>
             
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                  
                    <span>Allocated Budget:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(phase?.budget)} </span>
                  </div>
                
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                
                    <span>Expenditure:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(phase?.spent)} </span>
                  </div>
                 
                      {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="font-medium">
                        {formatCurrency(phase?.spent)} / {formatCurrency(phase?.budget)}
                      </span>
                    </div>
                   
                      <Progress spent={phase?.spent} budget={phase?.budget} mode="budget" className="h-2" />
                   
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Budget Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(phase?.variance)}</span>
                  </div>
                  
                </div>

                {/* Phase */}
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Project Name</p>
                  <p className="font-medium text-sm">{phase?.projectId?.name}</p>
                </div>
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Client Name</p>
                  <p className="font-medium text-sm">{phase?.client}</p>
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
                          This action cannot be undone. Do you really want to delete this phase?
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