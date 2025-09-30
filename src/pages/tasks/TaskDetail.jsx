import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Building2, Layers, CheckSquare, BookCheck, Tags, ReceiptText } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import AddTasks from "@/components/models/AddTask";
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
import AddExpense from "../../components/models/AddExpense";
export default function TaskDetail() {
  const expenseColumns =[
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
            setEditExpense(row.original); // pass whole row data
            setShowExpenseModal(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmExpenseDialog({ open: true, expenseId: row.original._id });
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
   {
    accessorKey: 'customId',
    header: 'Expense ID',
  },
  {
    accessorKey: 'name',
    header: 'Expense ',
    cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  },
  // {
  //   accessorKey: 'description',
  //   header: 'Description ',
  //   cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  // },
    {
    accessorKey: 'amount',
    header: 'Amount ',
     cell: info => {
      const amount = info.getValue();
      return formatCurrency(amount) || 'N/A'; // ✅ Display task name instead of object
    },
  },
  
  {
    accessorKey: 'taskId',
    header: 'Task ',
    cell: info => {
      const task = info.getValue();
      return task?.name || 'N/A'; // ✅ Display task name instead of object
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
    cell: info => {
      const val = info.getValue();
      if (!val) return "N/A";
      const d = new Date(val);
   
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
    
  },
 
  {
    accessorKey: 'paidTo',
    header: 'Paid To',
   
  },
  {
    accessorKey: 'category',
    header: 'Category',
   
  },
]

  const { id } = useParams();
  const navigate = useNavigate();
  const { taskContext,setTaskContext,memberContext,expenseContext,setExpenseContext,projectContext,phaseContext } = useData();
  const [task,setTask] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditExpense] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [memberOptions,setMemberOptions] =useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditTask] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, taskId: null });
  const [confirmExpenseDialog, setConfirmExpenseDialog] = useState({ open: false, expenseId: null });

  useEffect(()=>{
    const updatedTask = taskContext.find((t) => t._id === id);
     const expenseTask = expenseContext.filter(
        (expense) => String(expense.taskId?._id) === String(updatedTask?._id)
      );

      const totalExpense = expenseTask.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const totalBalance = updatedTask?.budget-totalExpense;
    setTask({
       ...updatedTask,
       budgetBalance:totalBalance,
       expense:totalExpense

    });
    setExpenses(expenseTask);
    fetchOptions();
  },[taskContext,expenseContext])
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
    setTaskOptions(taskContext.map(task=>({
      value:task._id,
      label:task.name,
    })))
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
  const handleRowClick = (row) => {
        navigate(`/expense/${row._id}`);
    };
        const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
//  Open Edit Modal
  const handleEdit = (task) => {
    setEditTask(task); // force new reference
    setShowModal(true);
  };
  const handleEditTask = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
       const members = memberOptions.filter((m) =>
        updated.assignedTo.includes(m.value)
      );
      const updatedTask = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
        assignedTo: members.map((m) => ({ _id: m.value, name: m.label })),
    
      }
     setTask(updatedTask);
    setTaskContext(prev =>
      prev.map((task) => task._id === updated._id ? updatedTask : task)
    );
    setEditTask(null);
    setShowModal(false);
  };

     const handleform = ( task = null , project=null,phase=null)=>{
        setEditExpense(null); // ✅ Clear old edit state
        setSelectedProject(project); // Set selected project
        setSelectedTask(task); // Set selected task
        setSelectedPhase(phase);
        setShowExpenseModal(true);    
  }
  // ✅ Add Expense (Backend) +Local state
  const handleAddExpense = async (expenseData) => {
   try {
      const project = projectOptions.find(p=>p.value ===expenseData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===expenseData.phaseId);
      const task = taskOptions.find(t=>t.value===expenseData.taskId);
      const newExpense = {
        ...expenseData,
        projectId:{_id:expenseData?.projectId,name:project?.label || ''},
        phaseId:{_id:expenseData?.phaseId,name:phase?.label || ''},
        taskId:{_id:expenseData?.taskId,name:task?.label || ''},
        
    
      }
      setExpenses(prev => [...prev, newExpense]);
      setExpenseContext(prev=>[...prev,newExpense]);
    } catch (error) {
      console.error("Error adding Expense:", error);
    }
  };

  const handleEditExpense = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
      const task = taskOptions.find(t=>t.value===updated.taskId);
      const updatedExpense = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
        taskId:{_id:updated?.taskId,name:task?.label || ''},
        
    
      }
     setExpenses(prev =>
      prev.map((task) => task._id === updated._id ? updatedExpense : task)
    );
    setExpenseContext(prev =>
      prev.map((expense) => expense._id === updated._id ? updatedExpense : expense)
    );
    setEditExpense(null);
    setShowModal(false);
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
               setTaskContext(prev => prev.filter(task => task._id !== id));
              setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Task deleted successfully.",
                });      
                navigate("/tasks");
           
            
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
       const handleDeleteExpense = async () => {
  const id = confirmExpenseDialog.expenseId;
  setConfirmExpenseDialog({ open: false, expenseId: null });
  try {
    await API.delete(`/expense/${id}`);

    setExpenseContext(prev => prev.filter(exp => exp._id !== id));
    setExpenses(prev => prev.filter(exp => exp._id !== id));

    setInfoDialog({
      open: true,
      type: "success",
      message: "Expense deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    setInfoDialog({
      open: true,
      type: "error",
      message: "Failed to delete expense.",
    });
  }
};
  if (!task) return <p className="p-6">Task not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{task.name}</h1>
          <Badge>{task.status}</Badge>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(task)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
           onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(task._id);
          }}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="space-y-4 p-3">
           <div className="flex items-center gap-2 ">
                <Tags   className="w-4 h-4"/>
               
            <p>Task Id: {task.customId}</p>
            </div>
             {task?.description&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Description: {task.description}</p>

            </div>}
           
          <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${task?.projectId?._id}`)}>Project Name: {task.projectId?.name}</p>
           </div>
            <div className="flex items-center gap-2 ">
                <Layers className="w-4 h-4"/>
         <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/phase/${task.phaseId?._id}`)}>Phase Name: {task?.phaseId?.name}</p>
            </div>
           
            <div className="flex items-center gap-2 ">
              <Calendar className="w-4 h-4" /> 
              <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Budget: ₹{task.budget}</span>
            </div>
            <div className="flex items-center gap-2 ">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Expenditure: ₹{task.expense}</span>
            </div>
            <div className="flex items-center gap-2 ">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Budget Balance: ₹{task.budgetBalance}</span>
            </div>
          

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between ">
              <span>Budget Used</span>
              <span>₹{task.expense} / ₹{task.budget}</span>
            </div>
             <Progress spent={task?.expense} budget={task?.budget} mode="budget" className="h-2" />
          </div>

          {/* Assigned Members */}
          <div>
            <h3 className="font-medium mb-2">Assigned Members</h3>
            <div className="flex gap-2 flex-wrap">
              {task.assignedTo?.map((m) => (
                <Badge key={m._id} variant="outline">{m.name}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {expenses.length>0?<>
          <div className=" flex items-center justify-between">
            <h1 className="text-2xl font-bold">Related Expenses </h1>
            <Button onClick={() => handleform(task,task.projectId,task.phaseId)}>
              <ReceiptIndianRupee className="w-4 h-4 mr-2" /> Add Expense
            </Button>
            </div>
          <DataTable data={expenses} columns={expenseColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
           
          </>  :
  
          
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2">
    <ReceiptText className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-lg font-medium text-gray-600">No expenses yet</p>
    <p className="text-sm text-gray-500 mb-4">Start by adding your first expense for this task</p>
    <Button onClick={() => handleform(task,task.projectId,task.phaseId)}>
      <ReceiptIndianRupee className="w-4 h-4 mr-2" /> Add Expense
    </Button>
  </Card>
  
  }
      <AddTasks
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditTask(null);
        }}
         onEdit={handleEditTask}
         editTask={editingTask}
      />
      <AddExpense
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditExpense(null);
            setSelectedTask(null); // Clear after close
            setSelectedProject(null);
            setSelectedPhase(null);
        }}
        selectedTask={selectedTask} // Pass selected task
        selectedPhase={selectedPhase} // Pass selected task
        selectedProject={selectedProject} // Pass selected project
        onSubmit={handleAddExpense}
         onEdit={handleEditExpense}
         editExpense={editingExpense}
      />
       {/* Confirm Delete AlertDialog for Task */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this task?
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

                  {/* Confirm Delete AlertDialog for expense */}
                  <AlertDialog
                        open={confirmExpenseDialog.open}
                        onOpenChange={(open) => setConfirmExpenseDialog({ ...confirmExpenseDialog, open })}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Do you really want to delete this expense?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteExpense}>Yes, Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
    </div>
  );
}
