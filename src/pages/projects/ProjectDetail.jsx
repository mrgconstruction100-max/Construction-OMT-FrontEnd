import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Building2, Tags, ReceiptText,Plus, CheckSquare, Layers, Eye } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import AddProject from "@/components/models/AddProject";
import AddPhases from "@/components/models/AddPhases";
import AddTasks from "@/components/models/AddTask";
import API from "@/axios";
import './ProjectDetail.css'
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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projectContext,setProjectContext,phaseContext,setPhaseContext,taskContext,setTaskContext,memberContext,clientContext,expenseContext,incomeContext } = useData();
  const [project,setProject] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject,setEditProject] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectId: null });
  const [confirmPhaseDialog, setConfirmPhaseDialog] = useState({ open: false, phaseId: null });
  const [confirmTaskDialog, setConfirmTaskDialog] = useState({ open: false, incomeId: null });
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [memberOptions,setMemberOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  //Phase
  const [phases,setPhases] = useState([]);
   const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditPhase] = useState(null);
  
  //Task
  const [tasks,setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
   const [editingTask, setEditTask] = useState(null);
    const {user} = useAuth();
  
  

  useEffect(()=>{
    const updatedProject = projectContext.find((p) => p._id === id);
    const filteredPhases = phaseContext.filter((phase)=> String(phase.projectId?._id)===String(updatedProject?._id));
    const filteredTasks = taskContext.filter((task)=> String(task.projectId?._id)===String(updatedProject?._id));
     const expenseProject = expenseContext.filter(
        (expense) => String(expense.projectId?._id) === String(updatedProject?._id)
      );

       const incomeProject = incomeContext.filter(
        (income) => String(income.projectId?._id) === String(updatedProject?._id)
      );
       const revenue = incomeProject.reduce(
        (sum, income) => sum + (income?.amount || 0),
        0
      );
      const totalExpense = expenseProject.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const totalBalance = updatedProject?.budget-totalExpense;
      const pending = updatedProject?.budget-revenue;
      const completedTasks =filteredTasks.filter(task=> String(task?.status)==="Completed");
      const completedPhases =filteredPhases.filter(phase=> String(phase?.status)==="Completed");
      let progress=0;
       if (filteredTasks.length > 0) {
          progress = (completedTasks.length / filteredTasks.length) * 100;
        }

        // round to 1 decimal place
        progress = Number(progress.toFixed(1));
    setProject({
       ...updatedProject,
       budgetBalance:totalBalance,
       expense:totalExpense,
       progress,
       revenue,
       pending,
       completedPhases,
       completedTasks,

    });
    fetchOptions();
    setPhases(filteredPhases);
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
  },[phaseContext,taskContext,projectContext,memberContext,clientContext])
  
  const fetchOptions = ()=>{
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
      })
      ))
      setClientOptions(clientContext.map(client=>({
        value:client._id,
        label:client.name,
      })
      ))
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

  /**********Project **********/
  //  Open Edit Modal
  const handleEdit = (project) => {
    setEditProject(project); // force new reference
    setShowProjectModal(true);
  };
   const handleEditProject = async(updated) => {
     
    const manager = memberOptions.find(m=> m.value === updated.projectManager);
      const client = clientOptions.find(m=> m.value === updated.clientId);
      const updatedProject = {
        ...updated,
        projectManager:{_id:updated.projectManager,name:manager?.label||""},
        clientId:{_id:updated.clientId,name:client?.label||""}
      }
     setProject(updatedProject);
    setProjectContext(prev =>
          prev.map((project) => project._id === updated._id ?updatedProject : project)
        );
    setEditProject(null);
    setShowProjectModal(false);
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
            setProjectContext(prev => prev.filter(project=> project._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Project deleted successfully.",
              });
             navigate("/projects");      
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete project.",
            });
            
          }
     }
 /************PHASE *********/

 const handleEditP = (phase) => {
    setEditPhase(phase); // force new reference
    setShowPhaseModal(true);
  };

   const handleEditPhase = async(updated) => {
     
     const project = projectOptions.find(p=>p.value === updated.projectId);

        const updatedPhase ={
          ...updated,
          projectId:{_id:updated?.projectId, name:project?.label ||''}
        }
     setPhases(updatedPhase);
    setPhaseContext(prev =>
          prev.map((phase) => phase._id === updated._id ? updatedPhase : phase)
    );
    setEditPhase(null);
    setShowPhaseModal(false);
  };

const handleAddPhase = async (phaseData) => {
    try {
      const project = projectOptions.find(p=>p.value ===phaseData.projectId);

      const newPhase = {
        ...phaseData,
        projectId:{_id:phaseData?.projectId,name:project?.label || ''}
      }
      setPhases(prev => [...prev, newPhase]);
      setPhaseContext(prev=>[...prev,newPhase]);
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };
 
    //  Delete Phase (Backend)
     const handleDeletePhase =async () => {
      const id = confirmPhaseDialog.phaseId
       setConfirmPhaseDialog({ open: false, phaseId: null })
       try{
          
          const filteredTasks = taskContext.filter((task) => String(task?.phaseId?._id) === String(id) );
          const filteredIncomes = incomeContext.filter((income)=> String(income?.phaseId?._id)===String(id));
          if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Phase is used for creating tasks. You can't delete it.",
                });
            return;
          }
         if(filteredIncomes.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "This Phase contains incomes. You can't delete it.",
                });
            return;
          }
          
            
            await API.delete(`/phase/${id}`);
           
            setPhaseContext(prev => prev.filter(phase=> phase._id !== id));
            setPhases(prev => prev.filter(phase=> phase._id !== id));
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
      setTaskContext(prev=>[...prev,newTask]);
    } catch (error) {
      console.error("Error adding Expense:", error);
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
        
      if (type === 'phase') {
        setEditPhase(null); // ✅ Clear old edit state
        setSelectedProject(project); // Set selected project
        setShowPhaseModal(true);
  }
}
  if (!project) return <p className="p-6">Phase not found</p>;

  return (
    <div className="p-6 space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between header">
        <div>
        <div className="flex gap-2 items-center mb-2">
          <Building2/><h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <Badge>{getStatusColor(project.status)}</Badge>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(project)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(project._id);
          }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

   {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
          <StatsCard
            title="Phases Completed"
            value={project?.completedPhases?.length || 0}
            description={`Out of ${phases?.length || 0}  total phases`}
            icon={<Layers className="w-5 h-5" />}
            
          />

           <StatsCard
            title="Tasks Completed"
            value={project?.completedTasks?.length || 0}
            description={`Out of ${tasks?.length || 0}  total tasks`}
            icon={<CheckSquare className="w-5 h-5" />}
            
          />
         
          
         
        </div>
      {/* Details */}
      <Card>
        <CardContent className="space-y-4 p-3 ">
           <div className="flex items-center gap-2 ">
                <Tags  className="w-4 h-4"/>
               
            <p>Project Id: {project.typeId}</p>
            </div>
             {project?.description&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Description: {project.description}</p>

            </div>}
           
          <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${project?.projectManager?._id}`)}>Project Manager: {project?.projectManager?.name}</p>
           </div>
              <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/client/${project?.clientId?._id}`)}>Client: {project?.clientId?.name}</p>
           </div>
                  
                  <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span >Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" mode="progress"/>
                </div>
           
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> 
              <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
            </div>
           <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Allocated Budget: ₹{project.budget}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Expenditure: ₹{project.expense}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Budget Balance: ₹{project.budgetBalance}</span>
            </div>
          

          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used</span>
              <span>₹{project.expense} / ₹{project.budget}</span>
            </div>
            
            <Progress spent={project?.expense} budget={project?.budget} mode="budget" className="h-2" />
            
          </div>
           <div className="flex items-center gap-2 text-sm">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Client Payments: ₹{project.revenue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm ">
              <ReceiptIndianRupee className="w-4 h-4" />
              <span>Pending from Clients: ₹{project.pending}</span>
            </div>
        
          <div></div>
            
   
        </CardContent>
      </Card>
      {/* Kanban Board Layout */}
       
      {phases.length>0?
      <div >
        <div className="flex items-center gap-16 mb-8 ">
             <h1 className="text-2xl font-bold">Related Phases and Tasks </h1>    
             <Button onClick={() => handleform("phase",null, project)} >
              <Layers className="w-4 h-4 mr-2" /> Add Phase
            </Button>
                </div>
                <div className="kanban-wrapper">
                <div className="kanban-scroll-container">
<div className="kanban-columns" >
  {phases.map((phase) => (
    <div
      key={phase._id}
      className="min-w-[300px] bg-accent p-3 rounded-lg shadow-sm flex flex-col  "
    >
      {/* Phase Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
        <h2 className="font-semibold" style={{ cursor: "pointer" }} onClick={()=>navigate(`/phase/${phase?._id}`)}>
          {phase.name} ({tasks.filter((t) => t.phaseId._id === phase._id).length})
        </h2>
                    <Button variant="ghost" size="sm" onClick={() => handleEditP(phase)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                          setConfirmPhaseDialog({ open: true, phaseId:phase._id });
                          }} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        </div>
        <Button  className="bg-orange-500 "
        onClick={() => handleform("task", phase, phase.projectId)}
        >
          <CheckSquare className="w-4 h-4" /> Add Task
        </Button>
      </div>
      <span className="text-xs text-gray-500 mb-2">{phase.customId}</span>

      {/* Task Cards */}
      <div className="space-y-3  gap-3">
        {tasks
          .filter((t) => t.phaseId._id === phase._id)
          .map((task) => (
            <Card
              key={task._id}
              className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group"
            >
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
                    <span className="font-medium text-foreground"> {task?.customId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">{formatDate(task?.startDate)} - {formatDate(task?.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{task?.teamSize} team members</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    
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
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
    
  ))}
</div>
</div>
</div>
</div>:<Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2">
    <Layers className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-lg font-medium text-gray-600">No Phases yet</p>
    <p className="text-sm text-gray-500 mb-4">Start by adding your first phase for this project</p>
    <Button onClick={() => handleform("phase",null, project)}  >
      <Layers className="w-4 h-4 mr-2" /> Add Phases
    </Button>
  </Card>

}

      
      
      <AddProject
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditProject(null);
        }}
         onEdit={handleEditProject}
         editProject={editingProject}
      />
      <AddPhases
        isOpen={showPhaseModal}
        onClose={() => {
          setShowPhaseModal(false);
          setEditPhase(null);
          setSelectedProject(null);
        }}
        onSubmit={handleAddPhase}
         onEdit={handleEditPhase}
         selectedProject={selectedProject} // Pass selected project
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
   

    {/* Confirm Delete AlertDialog for Phase */}
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
                            <AlertDialogAction onClick={handleDeleteTask} >Yes, Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Confirm Delete AlertDialog for Phase */}
                  <AlertDialog
                        open={confirmPhaseDialog.open}
                        onOpenChange={(open) => setConfirmPhaseDialog({ ...confirmPhaseDialog, open })}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Do you really want to delete this Phase?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeletePhase}>Yes, Delete</AlertDialogAction>
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
