import React, { useEffect, useState } from 'react'
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import AddProject from "@/components/models/AddProject";
import AddPhases from "@/components/models/AddPhases";
import AddTasks from "@/components/models/AddTask";
import AddExpense from '@/components/models/AddExpense';
import { 
  Building2, 
  CheckSquare, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  Layers,
  ListTodo,
  BadgeIndianRupee
} from "lucide-react";
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import AddIncome from '../../components/models/AddIncome';

const Dashboard = () => {
    const {user} = useAuth();
    const {projectContext,taskContext,memberContext,phaseContext,setProjectContext,
      setTaskContext,setPhaseContext,setExpenseContext,setIncomeContext} = useData();
    const [Tasks, setTasks] = useState('');
    const [Projects,setProjects] = useState('');
    const [memberOptions,setMemberOptions] = useState([]);
    const [projectOptions,setProjectOptions] = useState([]);
    const [phaseOptions,setPhaseOptions] =useState([]);
    const [taskOptions,setTaskOptions] =useState([]);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);

     useEffect(()=>{
      const completedTasks = taskContext.filter(
    (task) => String(task?.status) === "Completed"
  );
    const completedProjects = projectContext.filter((project)=>String(project?.status)=== "Completed");
    setProjects({
      totalProjects:projectContext.length,
      projectsCompleted:completedProjects.length,
      activeProjects: projectContext.length - completedProjects.length,
    })
  setTasks({
    totalTasks: taskContext.length,
    tasksCompleted: completedTasks.length,
    incompleteTasks: taskContext.length - completedTasks.length,
  });
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
      setTaskOptions(taskContext.map(task=>({
      value:task._id,
      label:task.name,
    })))
     setMemberOptions(memberContext.map(member=>({
      value:member._id,
      label:member.name,
    })))
    }

  const handleform = (type)=>{
   if (type === 'project') setShowProjectModal(true);
  if (type === 'task') setShowTaskModal(true);
  if (type === 'phase') setShowPhaseModal(true);
  if(type ==='expense')setShowExpenseModal(true);
   if(type ==='income')setShowIncomeModal(true);
  }
     const handleAddProject = (projectData) => {
 // setProjectData(prev => [...prev, newProject]);
  const manager = memberOptions.find(m=> m.value === projectData.projectManager);
      const client = memberOptions.find(m=> m.value === projectData.clientId);
      const newProject = {
        ...projectData,
        projectManager:{_id:projectData.projectManager,name:manager?.label||""},
        clientId:{_id:projectData.clientId,name:client?.label||""}
      }
  setProjectContext(prev=>[...prev,newProject]);
};

const handleAddTask = (taskData) => {
  //setTaskData(prev => [...prev, newTask]);
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
  setTaskContext(prev => [...prev, newTask]);
};

const handleAddPhase = (phaseData) => {
  //setPhaseData(prev => [...prev, newPhase]);
  const project = projectOptions.find(p=>p.value ===phaseData.projectId);

      const newPhase = {
        ...phaseData,
        projectId:{_id:phaseData?.projectId,name:project?.label || ''}
      }
  setPhaseContext(prev => [...prev, newPhase]);
};

const handleAddExpense =(expenseData)=>{ 
  //setExpense(prev=>[...prev,newExpense]);
  const project = projectOptions.find(p=>p.value ===expenseData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===expenseData.phaseId);
      const task = taskOptions.find(t=>t.value===expenseData.taskId);
      const newExpense = {
        ...expenseData,
        projectId:{_id:expenseData?.projectId,name:project?.label || ''},
        phaseId:{_id:expenseData?.phaseId,name:phase?.label || ''},
        taskId:{_id:expenseData?.taskId,name:task?.label || ''},
        
    
      }
  setExpenseContext(prev => [...prev, newExpense]);
}
const handleAddIncome =(incomeData)=>{ 
  //setExpense(prev=>[...prev,newExpense]);
  const project = projectOptions.find(p=>p.value ===incomeData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===incomeData.phaseId);
      const newIncome = {
        ...incomeData,
        projectId:{_id:incomeData?.projectId,name:project?.label || ''},
        phaseId:{_id:incomeData?.phaseId,name:phase?.label || ''},
      
    
      }
  setIncomeContext(prev => [...prev, newIncome]);
}
  return (
  
      <div className="space-y-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back {user?.role}! Here's what's happening with your projects.
            </p>
          </div>
          {/* <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Projects"
            value={Projects?.activeProjects}
            description={`Out of ${Projects.totalProjects || 0} total projects`}
            icon={<Building2 className="w-5 h-5" />}
            to="/projects" 
            // trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Tasks Completed"
            value={Tasks?.tasksCompleted || 0}
            description={`Out of ${Tasks?.totalTasks || 0}  total tasks`}
            icon={<CheckSquare className="w-5 h-5" />}
             to="/tasks" 
            // trend={{ value: 8, isPositive: true }}
          />
          {user.role==="Admin"&&
          <StatsCard
            title="Team Members"
            value={memberContext.length}
            description="Across all projects"
            icon={<Users className="w-5 h-5" />}
             to="/members" 
            // trend={{ value: 2, isPositive: false }}
          />
          }
          <StatsCard
            title="Overdue Tasks"
            value={Tasks?.incompleteTasks || 0}
            description="Require immediate attention"
            icon={<AlertTriangle className="w-5 h-5" />}
             to="/tasks" 
            // trend={{ value: 12, isPositive: false }}
          />
         
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Progress - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProjectProgress />
          </div>

          {/* Recent Activity - Takes 1 column */}
          {user.role==="Admin"&&
          <div>
            <RecentActivity />
          </div>
          }
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AddProject
                isOpen={showProjectModal}
                onClose={() => {
                 setShowProjectModal(false)             
                }}
                onSubmit={handleAddProject}
                editProject={null}
              />
              <AddTasks
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSubmit={handleAddTask}
                editTask={null}
              />
              <AddPhases
              isOpen={showPhaseModal}
              onClose={() => {
                 setShowPhaseModal(false)
              }}
              onSubmit={handleAddPhase}
              
              editPhase={null}
            />
           <AddExpense
              isOpen={showExpenseModal}
              onClose={() => {
                 setShowExpenseModal(false)
              }}
              onSubmit={handleAddExpense}
              
              editExpense={null}
            />
             <AddIncome
                    isOpen={showIncomeModal}
                    onClose={() => {
                     setShowIncomeModal(false)
                    }}
                    onSubmit={handleAddIncome}
                    editExpense={null}
                  />
                  {user.role==="Admin"&&<>
          <div onClick={() => handleform("project")} className="p-4 border border-muted-foreground/20 rounded-lg hover:shadow-soft transition-smooth cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">New Project</h3>
                <p className="text-sm text-muted-foreground">Start a new construction project</p>
              </div>
            </div>
          </div>

          <div onClick={() => handleform("phase")} className="p-4 border border-muted-foreground/20 rounded-lg hover:shadow-soft transition-smooth cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-smooth">
                <Layers className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Add Phase</h3>
                <p className="text-sm text-muted-foreground">Create a new phase for Project</p>
              </div>
            </div>
          </div>
     <div onClick={() => handleform("task")} className="p-4 border border-muted-foreground/20 rounded-lg hover:shadow-soft transition-smooth cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-smooth">
                <CheckSquare className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Add Task</h3>
                <p className="text-sm text-muted-foreground">Create a new task</p>
              </div>
            </div>
          </div>
             <div onClick={() => handleform("income")} className="p-4 border border-muted-foreground/20 rounded-lg hover:shadow-soft transition-smooth cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/10 transition-smooth">
                <BadgeIndianRupee className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Add Income</h3>
                <p className="text-sm text-muted-foreground">Add income for phases</p>
              </div>
            </div>
          </div>
          <div onClick={() => handleform("expense")} className="p-4 border border-muted-foreground/20 rounded-lg hover:shadow-soft transition-smooth cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-smooth">
                <ListTodo className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Add Expense</h3>
                <p className="text-sm text-muted-foreground">Add expenses for tasks</p>
              </div>
            </div>
          </div>
           </>}
        </div>
        
      </div>
   
  );
};

export default Dashboard;
