import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useData } from "../../context/DataContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



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

const getProgressColor = (progress, status) => {
  if (status === "delayed") return "bg-destructive";
  if (progress >= 80) return "bg-success";
  if (progress >= 50) return "bg-primary";
  return "bg-warning";
};

export function ProjectProgress() {

  const {projectContext,taskContext} = useData();
  const [projects,setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
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

      

      return {
        ...project,
        totalTasks: projectTasks.length,
        tasksCompleted: completedTasks.length,
        progress
      };
    });
      setProjects(updatedProjects);
  },[projectContext,taskContext])
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
      const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
          return date.toLocaleDateString('en-IN',{
                  day:"numeric",
                  month:"long",
                  year:"2-digit"
                })
        }
  return (
    <Card className="border-muted-foreground/20 overflow-auto h-[500px] flex flex-col ">
      <CardHeader className="flex-shrink-0 bg-white sticky top-0 z-10 ">
        <CardTitle className="text-lg font-semibold  ">Project Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((project) => (
          <div key={project._id} className="space-y-3" >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0" onClick={() => navigate(`project/${project._id}`)} style={{ cursor: "pointer" }}>
                <h4 className="font-medium text-foreground truncate" >{project.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Due {formatDate(project.endDate)}  • {project.tasksCompleted}/{project.totalTasks} tasks
                </p>
              </div>
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress 
                value={project.progress} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}