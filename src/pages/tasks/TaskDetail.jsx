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
  const { taskContext,setTaskContext,memberContext,projectContext,phaseContext } = useData();
  const [task,setTask] = useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [memberOptions,setMemberOptions] =useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditTask] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, taskId: null });
  

  useEffect(()=>{
    const updatedTask = taskContext.find((t) => t._id === id);
    setTask(updatedTask);
      
    fetchOptions();
  },[taskContext])
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

  
  
  const handleDeleteClick = (id) => {
      setConfirmDialog({ open: true, taskId: id })
    }
     //  Delete Task (Backend)
       const handleDelete =async () => {
        const id = confirmDialog.taskId
         setConfirmDialog({ open: false, taskId: null })
         try{
        
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
               
            <p>Task Id: {task.typeId}</p>
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
   

          {/* Assigned Members */}
          <div>
            <h3 className="font-medium mb-2">Assigned Members</h3>
            <div className="flex gap-2 flex-wrap" >
              {task.assignedTo?.map((m) => (
                <Badge key={m._id} variant="outline" style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${m?._id}`)}>{m.name}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <AddTasks
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditTask(null);
        }}
         onEdit={handleEditTask}
         editTask={editingTask}
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

           
    </div>
  );
}
