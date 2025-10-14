import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Eye, Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Building2, Layers, CheckSquare, BookCheck, Tags, ReceiptText } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import AddPhases from "@/components/models/AddPhases";
import AddTasks from "@/components/models/AddTask";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import AddIncome from '@/components/models/AddIncome';
import { StatsCard } from "@/components/dashboard/StatsCard";
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
import API from "../../axios";
import DataTable from '@/components/Table/DataTable';

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
export default function PhaseDetail() {

  //Task Table Columns

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
              handleEditT(row.original); // pass whole row data
             
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmTaskDialog({ open: true, taskId:row.original._id });
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
   {
    accessorKey: 'customId',
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
    cell: info => new Date(info.getValue()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
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

//Income Table Column

 const incomeColumns =[
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
            setEditIncome(row.original); // pass whole row data
            setShowIncomeModal(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmIncomeDialog({ open: true, incomeId:row.original._id });
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
   {
    accessorKey: 'customId',
    header: 'Income ID',
  },
  {
    accessorKey: 'name',
    header: 'Income ',
    cell: info => info.getValue()?.toString().slice(0, 20) || '-', // truncate if long
  },
    {
    accessorKey: 'amount',
    header: 'Amount ',
     cell: info => {
      const amount = info.getValue();
      return formatCurrency(amount) || 'N/A'; // ✅ Display task name instead of object
    },
  },
  
  {
    accessorKey: 'phaseId',
    header: 'Phase ',
    cell: info => {
      const phase = info.getValue();
      return phase?.name|| 'N/A'; // ✅ Display task name instead of object
    },
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
    accessorKey: 'paymentDate',
    header: 'Payment Date',
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
    
  },
   {
    accessorKey: 'transactionNo',
    header: 'Reference No',
    cell: info => info.getValue()?.toString().slice(0, 20) || '-', // truncate if long
  },
]
  const { id } = useParams();
  const navigate = useNavigate();
  const { taskContext,setTaskContext,setPhaseContext,memberContext,expenseContext,incomeContext,setIncomeContext,projectContext,phaseContext } = useData();
  const [phase,setPhase] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingPhase, setEditPhase] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, phaseId: null });
  const [confirmIncomeDialog, setConfirmIncomeDialog] = useState({ open: false, incomeId: null });
  const [confirmTaskDialog, setConfirmTaskDialog] = useState({ open: false, incomeId: null });

  //Income
    const [incomes,setIncomes] = useState([]);
     const [showIncomeModal, setShowIncomeModal] = useState(false);
     const [editingIncome, setEditIncome] = useState(null);
  //Tasks

  const [allTasks,setAllTasks] = useState([]); // all data
  const [tasks,setTasks]=useState([]); // filtered data
  const [editingTask, setEditTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
   const [view,setView] = useState('card');
   const [taskOptions,setTaskOptions] =useState([]);
   const [memberOptions,setMemberOptions] =useState([]);
     const handleToggle = (newView) => {
      setView(newView);
    };
  useEffect(()=>{

    //For Phase
    const updatedPhase = phaseContext.find((p) => p._id === id);
    const filteredTasks = taskContext.filter((task)=> String(task.phaseId?._id)===String(updatedPhase?._id))
     const expensePhase = expenseContext.filter(
        (expense) => String(expense.phaseId?._id) === String(updatedPhase?._id)
      );
       const incomePhase = incomeContext.filter(
        (income) => String(income?.phaseId?._id) === String(updatedPhase?._id)
      );
      const revenue = incomePhase.reduce(
        (sum, income) => sum + (income?.amount || 0),
        0
      );
      const totalExpense = expensePhase.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      //  const totalBudget = filteredTasks.reduce(
      //   (sum, task) => sum + (task?.budget || 0),
      //   0
      // );
      const totalBalance = updatedPhase?.budget-totalExpense;
      const pending = updatedPhase?.budget-revenue;
     
      const completedTasks =filteredTasks.filter(task=> String(task?.status)==="Completed");
      let progress=0;
       if (filteredTasks.length > 0) {
          progress = (completedTasks.length / filteredTasks.length) * 100;
        }

        // round to 1 decimal place
        progress = Number(progress.toFixed(1));
    setPhase({
       ...updatedPhase,
       
       budgetBalance:totalBalance,
       expense:totalExpense,
       progress,
       revenue,
       pending,
       completedTasks

    })

    // For Tasks
    
    const updatedTasks = filteredTasks.map((task) => {
      const expenseTasks = expenseContext.filter(
        (expense) => String(expense.taskId?._id) === String(task._id)
      );

      const totalExpense = expenseTasks.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const totalBalance = task.budget-totalExpense;
      const pending = task.budget-revenue;

      return {
        ...task,
        expense: totalExpense,
        totalBalance
      };
    });


    setTasks(updatedTasks);
     setAllTasks(updatedTasks);
    setIncomes(incomePhase);
     fetchOptions();
  },[phaseContext,expenseContext,taskContext,memberContext,projectContext,incomeContext])
  

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
      setTaskOptions(taskContext.map(task=>({
      value:task._id,
      label:task.name,
    })))
      setMemberOptions(memberContext.map(member=>({
      value:member._id,
      label:member.name,
    })))

    }
    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
 const handleRowClick = (row) => {
        navigate(`/task/${row._id}`);
    };
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
/************Phase ********** */
  //  Open Edit Modal
  const handleEdit = (phase) => {
    setEditPhase(phase); // force new reference
    setShowPhaseModal(true);
  };
  const handleEditPhase = async(updated) => {
     
     const project = projectOptions.find(p=>p.value === updated.projectId);

        const updatedPhase ={
          ...updated,
          projectId:{_id:updated?.projectId, name:project?.label ||''}
        }
     setPhase(updatedPhase);
    setPhaseContext(prev =>
          prev.map((phase) => phase._id === updated._id ? updatedPhase : phase)
    );
    setEditPhase(null);
    setShowPhaseModal(false);
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
          if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Phase is used for creating tasks. You can't delete it.",
                });
            return;
          }
         
          
            
            await API.delete(`/phase/${id}`);
           
            setPhaseContext(prev => prev.filter(phase=> phase._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Phase deleted successfully.",
              });
              navigate("/phases");         
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

     /************Task *********/

     const handleEditT = (task) => {
    setEditTask(task); // force new reference
    setShowTaskModal(true);
  };

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
    setEditTask(null);
    setShowTaskModal(false);
  };

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
  const handleDeleteTask = async () => {
  const id = confirmTaskDialog.taskId;
  setConfirmTaskDialog({ open: false, taskId: null });
  try {
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

    setTaskContext(prev => prev.filter(t => t._id !== id));
    setTasks(prev => prev.filter(t => t._id !== id));
    setAllTasks(prev => prev.filter(t => t._id !== id));

    setInfoDialog({
      open: true,
      type: "success",
      message: "Task deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    setInfoDialog({
      open: true,
      type: "error",
      message: "Failed to delete task.",
    });
  }
};
  const handleform = (type , phase = null , project=null)=>{
      if (type === 'task') {
        setEditTask(null);
        setSelectedProject(project);
        setSelectedPhase(phase);
        setShowTaskModal(true);
      }
        
      if (type === 'income') {
        setEditIncome(null); // ✅ Clear old edit state
        setSelectedProject(project); // Set selected project
        setSelectedPhase(phase);
        setShowIncomeModal(true);
  }
}

/***************INCOME ****************/
 const handleAddIncome = async (incomeData) => {
   try {
       const project = projectOptions.find(p=>p.value ===incomeData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===incomeData.phaseId);
      const newIncome = {
        ...incomeData,
        projectId:{_id:incomeData?.projectId,name:project?.label || ''},
        phaseId:{_id:incomeData?.phaseId,name:phase?.label || ''},
    
      }
      setIncomes(prev => [...prev, newIncome]);
      setIncomeContext(prev=>[...prev,newIncome]);
    } catch (error) {
       console.error("Error adding Income:", error);
    }
  };

  const handleEditIncome = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
      const updatedIncome = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
        
    
      }

     setIncomes(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome : income)
    );
    
    setIncomeContext(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome : income)
    );
    setEditIncome(null);
    setShowIncomeModal(false);
  };

  const handleDeleteIncome =async () => {
      const id = confirmIncomeDialog.incomeId
       setConfirmIncomeDialog({ open: false, incomeId: null })
       try{
    
            await API.delete(`/income/${id}`);
            setIncomes(incomes.filter(income =>income._id !== id));
            setIncomeContext(incomeContext.filter(income =>income._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Income deleted successfully.",
              });         
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete income.",
            });
            
          }
     }
  if (!phase) return <p className="p-6">Phase not found</p>;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between ">
        <div>
          <div className="flex gap-2 items-center mb-2">
          <Layers/><h1 className="text-2xl font-bold">{phase.name}</h1>
          </div>
          <Badge>{phase.status}</Badge>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(phase)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
           onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(phase._id);
          }}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
          <StatsCard
            title="Tasks Completed"
            value={phase?.completedTasks?.length || 0}
            description={`Out of ${tasks?.length || 0}  total tasks`}
            icon={<CheckSquare className="w-5 h-5" />}
            
          />
         
          
         
        </div>

      {/* Details */}
      <Card>
        <CardContent className="space-y-4 p-3">
          <div className="flex items-center gap-2 ">
                <Tags  className="w-4 h-4"/>
               
            <p>Phase Id: {phase?.typeId}</p>
            </div>
             {phase?.description&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Description: {phase?.description}</p>

            </div>}
           
          <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${phase?.projectId?._id}`)}>Project Name: {phase.projectId?.name}</p>
           </div>
           <div className="space-y-2">
                  
                  <div className="flex justify-between text-sm">
                    <span >Progress</span>
                    <span className="font-medium">{phase?.progress}%</span>
                  </div>
                  <Progress value={phase?.progress} mode="progress" className="h-2" />
                </div>
           
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> 
              <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Allocated Budget: ₹{phase.budget}</span>
            </div>
            <div className="flex items-center gap-2 text-sm ">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Expenditure: ₹{phase.expense}</span>
            </div>
           <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Budget Balance: ₹{phase.budgetBalance}</span>
            </div>
          

       {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used</span>
              <span>₹{phase.expense} / ₹{phase.budget}</span>
            </div>
            <Progress spent={phase?.expense} budget={phase?.budget} mode="budget" className="h-2" />
          </div>
           {/* <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Client Payments: ₹{phase.revenue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm ">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Pending from Clients: ₹{phase.pending}</span>
            </div> */}
            {/* Return Progress */}
          {/* <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Return Ratio</span>
              <span>₹{phase.expense} / ₹{phase.revenue}</span>
            </div>
  
              <Progress spent={phase?.expense} budget={phase?.revenue} mode="budget" className="h-2" />
          </div> */}
          {/* Assigned Members */}
          <div>
        
          </div>
        </CardContent>
      </Card>
      {/* {incomes.length>0?<div className="space-y-6 ">
          <div className=" flex items-center justify-between ">
            <h1 className="text-2xl font-bold">Related Incomes </h1>
            <Button onClick={() => handleform("income", phase, phase.projectId)}>
              <ReceiptIndianRupee className="w-4 h-4 mr-2" /> Add Income
            </Button>
            </div>
          <DataTable data={incomes} columns={incomeColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
           
          </div>  :
  
          
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2">
    <ReceiptText className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-lg font-medium text-gray-600">No income yet</p>
    <p className="text-sm text-gray-500 mb-4">Start by adding your first income for this phase</p>
    <Button onClick={() => handleform("income", phase, phase.projectId)}>
      <ReceiptIndianRupee className="w-4 h-4 mr-2" /> Add Income
    </Button>
  </Card>
  
  } */}
{tasks.length>0?
      <div className="space-y-6 ">
         <div className="flex items-center justify-between">
             <h1 className="text-2xl font-bold">Related Tasks </h1>    <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
             <Button onClick={() => handleform("task",phase, phase.projectId)} >
              <CheckSquare className="w-4 h-4 mr-2" /> Add Tasks
            </Button>
                </div>

     <div className="mt-16 space-y-6">
      {view === 'table' &&
        <>
        
          {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
             {/* <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              /> */}
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
              {/* <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              /> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.filter(task => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            task.name?.toLowerCase().includes(search) ||
             task._id?.toLowerCase().includes(search)

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
                    <Button variant="ghost" size="sm" onClick={() => handleEditT(task)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                     e.stopPropagation();
                       setConfirmTaskDialog({ open: true, taskId:task._id });
                       }} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                
                
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
                  
                  
                  {/* <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    
                    <span>Budget:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(task?.budget)} </span>
                  </div> */}
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Expenditure:</span>
                    <span className="font-medium text-foreground">{formatCurrency(task?.expense)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{task.assignedTo?.map((m) => (
                    <Badge key={m._id}  style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${m?._id}`)}>{m.name}</Badge>
              ))}</span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Budget Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(task?.totalBalance)}</span>
                  </div> */}
                      {/* Budget Progress */}
                  {/* <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="font-medium">
                        {formatCurrency(task?.expense)} / {formatCurrency(task?.budget)}
                      </span>
                    </div>
                    
                     <Progress spent={task?.expense} budget={task?.budget} mode="budget" className="h-2" />
                  </div> */}
                </div>

              
             
              </CardContent>
            </Card>
          ))}
        </div>
        </>
        
}
 
</div>  
      </div>:<Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2">
    <CheckSquare className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-lg font-medium text-gray-600">No Tasks yet</p>
    <p className="text-sm text-gray-500 mb-4">Start by adding your first task for this phase</p>
    <Button onClick={() => handleform("task", phase, phase.projectId)} >
      <CheckSquare className="w-4 h-4 mr-2" /> Add Tasks
    </Button>
  </Card>}
      
         <AddPhases
        isOpen={showPhaseModal}
        onClose={() => {
          setShowPhaseModal(false);
          setEditPhase(null);
        }}
         onEdit={handleEditPhase}
         editPhase={editingPhase}
      />

      <AddTasks
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditTask(null);
          setSelectedProject(null);
            setSelectedPhase(null);
        }}
        selectedPhase={selectedPhase} // Pass selected task
        selectedProject={selectedProject} // Pass selected project
         onSubmit={handleAddTask}
         onEdit={handleEditTask}
         editTask={editingTask}
      />
      <AddIncome
        isOpen={showIncomeModal}
        onClose={() => {
          setShowIncomeModal(false);
          setEditIncome(null);
          // Clear after close
            setSelectedProject(null);
            
        }}
        
        
        selectedProject={selectedProject} // Pass selected project
        onSubmit={handleAddIncome}
        onEdit={handleEditIncome}
        editIncome={editingIncome}
      />
      {/* Confirm Delete AlertDialog for Phase */}
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

                   {/* Confirm Delete AlertDialog for Task */}
                  <AlertDialog
                        open={confirmTaskDialog.open}
                        onOpenChange={(open) => setConfirmTaskDialog({ ...confirmTaskDialog, open })}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Do you really want to delete this task?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteTask}>Yes, Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Confirm Delete AlertDialog for Income */}
                  <AlertDialog
                        open={confirmIncomeDialog.open}
                        onOpenChange={(open) => setConfirmIncomeDialog({ ...confirmIncomeDialog, open })}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Do you really want to delete this income?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteIncome}>Yes, Delete</AlertDialogAction>
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
  );
}
