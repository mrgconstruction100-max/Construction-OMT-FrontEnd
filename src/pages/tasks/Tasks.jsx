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
  ReceiptIndianRupee,
  Tags
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/Table/DataTable";
import AddTasks from "@/components/models/AddTask";
import { useData } from "@/context/DataContext";

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
import API from "@/axios";
import FilterComp from "../../components/filter/FilterComp";
import FilterStatus from "../../components/filter/FilterStatus";


const getStatusColor = (status) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-500 text-white";
    case "Cancelled":
      return "bg-red-900/60 text-white"; // close to #330f0f96
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
export default function Tasks() {
  const tasksColumns =[
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
    header: 'Task ID',
  },
  {
    accessorKey: 'name',
    header: 'Task title',
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
    cell: info => {    const val = info.getValue();
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
        'Cancelled': '#330f0f96'
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
  const [allTasks,setAllTasks] = useState([]); // all data
  const [tasks,setTasks]=useState([]); // filtered data
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view,setView] = useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
   const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [memberOptions,setMemberOptions] =useState([]);
  const {taskContext,memberContext,projectContext,setTaskContext,phaseContext,expenseContext} = useData();
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, taskId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  const handleToggle = (newView) => {
      setView(newView);
    };

    useEffect(() => {
  
    const updatedTasks = taskContext.map((task) => {
      const expenseTasks = expenseContext.filter(
        (expense) => String(expense.taskId?._id) === String(task._id)
      );

      const totalExpense = expenseTasks.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const totalBalance = task.budget-totalExpense;

      return {
        ...task,
        expense: totalExpense,
        totalBalance
      };
    });

    setTasks(updatedTasks);
     setAllTasks(updatedTasks);
      fetchOptions();
  }
, [expenseContext, taskContext]);

    

    const fetchOptions =() =>{
      setProjectOptions(projectContext.map(project=>({
        value:project._id,
        label:project.name,
      })
      ))
       setPhaseOptions(phaseContext.map(phase=>({
        value:phase._id,
        label:phase.name,
      })
      ))
      setMemberOptions(memberContext.map(member=>({
      value:member._id,
      label:member.name,
    })))
    }
    
     // ✅ Add Task (Backend) +Local state
  const handleAddTask = async (taskData) => {
   try {
      const project = projectOptions.find(p=>p.value ===taskData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===taskData.phaseId);
      const members = memberOptions.filter((m) =>
        taskData.assignedTo.includes(m.value)
      );
      const newTask = {
        ...taskData,
        projectId:{_id:taskData?.projectId,name:project?.label || ''},
        phaseId:{_id:taskData?.phaseId,name:phase?.label || ''},
        assignedTo: members.map((m) => ({ _id: m.value, name: m.label })),
    
      }
      setTasks(prev => [...prev, newTask]);
      setAllTasks(prev => [...prev, newTask]);
      setTaskContext(prev=>[...prev,newTask]);
    } catch (error) {
      console.error("Error adding Task:", error);
    }
  };
  // ✅ Update Project in front end for quick response
    const handleEditTask = async(updated) => {
     
      const phase = phaseOptions.find(ph => ph.value === updated.phaseId);
      const project = projectOptions.find(p => p.value === updated.projectId);
      const members = memberOptions.filter((m) =>
        updated.assignedTo.includes(m.value)
      );
     const updatedTask = {
      ...updated,
      phaseId: { _id: updated.phaseId, name: phase?.label || '' },
      projectId:{_id:updated.projectId,name:project?.label ||''},
      assignedTo: members.map((m) => ({ _id: m.value, name: m.label })),
    };

    setTasks(prev =>
      prev.map((task) => task._id === updated._id ? updatedTask : task)
    );
    setAllTasks(prev =>
      prev.map((task) => task._id === updated._id ? updatedTask :task)
    );
    setTaskContext(prev =>
      prev.map((task) => task._id === updated._id ? updatedTask : task)
    );
    setEditingTask(null);
    setShowModal(false);
  };
  //  Open Edit Modal
  const handleEdit = (task) => {
    setEditingTask(task); // force new reference
    setShowModal(true);
  };
    const handleRowClick = (row) => {
        navigate(`/task/${row._id}`);
    };

    const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, taskId: id })
  }
   //  Delete Task (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.taskId
       setConfirmDialog({ open: false, taskId: null })
       try{
          
          const filteredTasks = expenseContext.filter((expense) => String(expense.taskId._id) === String(id) );
          if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Task is used for creating expense. You can't delete it.",
                });
            return;
          }
         
          
            
            await API.delete(`/task/${id}`);
            setTasks(tasks.filter(task =>task._id !== id));
            setAllTasks(allTasks.filter(task => task._id !== id));
            setTaskContext(taskContext.filter(task=> task._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Task deleted successfully.",
              });         
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete task.",
            });
            
          }
     }
   const  formatDate = (dateString) => {
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

         // Filter the tasks based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setTasks(allTasks); // ✅ show all again
          setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allTasks];
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

        if (filters.project) {
          filtered = filtered.filter(
            (p) => p.projectId.name === filters.project
          );
          newActiveFilters.project = filters.project;
        }
        if (filters.phase) {
          filtered = filtered.filter(
            (p) => p.phaseId.name === filters.phase
          );
          newActiveFilters.phase = filters.phase;
        }
         if (filters.assignto&& filters.assignto.length > 0) {
          filtered = filtered.filter(
            (p) => Array.isArray(p.assignedTo) && p.assignedTo.some((member) =>
            filters.assignto.includes(member.name)
          )
          );
          newActiveFilters.assignto = filters.assignto;
        }


        setTasks(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };


    
  
  // Filter configuration for tasks
  const tasksFilterConfig = {
    labels: {
      startDate: 'Date From',
      endDate: 'Date To', 
      project: 'Project',
      priority: 'Priority',
      status: 'Status'
    },
    fieldTypes: {
      startDate: 'date',
      endDate: 'date',
      project: 'string',
      priority: 'string',
      status: 'string'
    },
   
  };
    // Modify clearFilter to also update filterValues
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
    setTasks(allTasks);
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
                      placeholder="Search tasks..."
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
                    New Task
                  </Button>
                  
                   <FilterComp
                      fields={[
                        { name: "startDate", label: "Date From", type: "startDate" },
                        { name: "endDate", label: "Date To", type: "endDate" },
                        { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
                        { name: "phase", label: "Phase", type: "select", options: phaseOptions.map((ph) => ph.label) },
                        { name: "status", label: "Status", type: "select", options: ["Planning", "In Progress", "Completed","On Hold","Cancelled"] },
                        { name: "assignto", label: "Assigned To", type: "multiselect", options: memberOptions.map((m) => m.label) }
                      ]}
                      onApplyFilters={(filters) => applyFilters(filters)}
                      initialValues={filterValues}
                    />
                </div>
              
          </div>
          <AddTasks
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleAddTask}
        onEdit={handleEditTask}
        editTask={editingTask}
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
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              />
            <div>
          <DataTable data={tasks} columns={tasksColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
        </>
      }
        {/* Projects Grid */}
        {view === 'card' &&
       <>
       
        {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.filter(task => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            task.name?.toLowerCase().includes(search) ||
             task.typeId?.toLowerCase().includes(search)

          );
        }).map((task) => (
            <Card key={task._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {task?.name}
                    </CardTitle>
                    <Badge variant="secondary" className={getStatusColor(task?.status)}>
                      {task?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button variant="ghost" size="sm" onClick={()=>navigate(`/task/${task._id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(task._id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task?.description}
                </p>

        
                {/* Project Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tags className="w-4 h-4" />
                    <span>Task Id:</span>
                    <span className="font-medium text-foreground"> {task?.typeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">{formatDate(task?.startDate)} - {formatDate(task?.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{task.assignedTo?.map((m) => (
                    <Badge key={m._id}  style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${m?._id}`)}>{m.name}</Badge>
              ))}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    {/* <span>${(task.budget / 1000000).toFixed(1)}M budget</span> */}
                    <span>Budget:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(task?.budget)} </span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Expenditure:</span>
                    <span className="font-medium text-foreground">{formatCurrency(task?.expense)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Budget Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(task?.totalBalance)}</span>
                  </div>
                      {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="font-medium">
                        {formatCurrency(task?.expense)} / {formatCurrency(task?.budget)}
                      </span>
                    </div>
                   
                     <Progress spent={task?.expense} budget={task?.budget} mode="budget" className="h-2" />
                  </div>
                </div>

                {/* Client */}
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Phase Name</p>
                  <p className="font-medium text-sm">{task?.phaseId?.name}</p>
                </div>
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Project Name</p>
                  <p className="font-medium text-sm">{task?.projectId?.name}</p>
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