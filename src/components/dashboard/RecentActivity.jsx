import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import API from "../../axios";
import { useNavigate } from "react-router-dom";


const getActivityColor = (type) => {
  switch (type) {
    case "PROJECT":
      return "bg-primary text-primary-foreground";      // Blue (main accent)
    case "TASK":
      return "bg-success text-success-foreground";      // Green (done/active)
    case "MEMBER":
      return "bg-secondary text-secondary-foreground";  // Neutral secondary
    case "CLIENT":
      return "bg-orange-400 text-secondary-foreground"; 
    case "PHASE":
      return "bg-purple-500 text-white";                // Purple (sub-levels)
    case "EXPENSE":
      return "bg-red-500 text-white";                   // Red (money outflow)
    case "USER":
      return "bg-teal-500 text-white";                  // Teal (accounts)
    case "INCOME":
      return "bg-green-700 text-white";  
    default:
      return "bg-muted text-muted-foreground";          // Fallback
  }
};


export function RecentActivity() {
  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate= useNavigate();

  useEffect(()=>{
    fetchActivityList();
  },[])

  const fetchActivityList = async()=>{
      try{
          const res = await API.get("/activityList/dashboard");
          setActivityList(res.data);
        }
        catch(error){
          console.error("Error fetching ActivityList:", error);
        }
        finally{
           setLoading(false);
        }
  }
  // RecentActivitylist
const renderActivityDetails = (activity) => {
  const { type, action, meta } = activity;
  switch (type) {
  case "PROJECT":
    return (
      <>
        <span className="text-sm text-muted-foreground">New project </span>
        <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
        <span className="text-sm text-muted-foreground"> created for client </span>
        <span className="text-sm font-medium text-primary">{meta?.clientName}</span>.
      </>
    );

  case "PHASE":
    return (
      <>
        <span className="text-sm text-muted-foreground">Phase </span>
        <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
        <span className="text-sm text-muted-foreground"> added to project </span>
        <span className="text-sm font-medium text-primary">{meta?.projectName}</span>.
      </>
    );

  case "TASK":
    return (
      <>
        <span className="text-sm text-muted-foreground">Task </span>
        <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
        <span className="text-sm text-muted-foreground"> created under phase </span>
        <span className="text-sm font-medium text-primary">{meta?.phaseName}</span>
        {meta?.memberNames?.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground"> and assigned to </span>
            <span className="text-sm font-medium text-secondary">
              {meta.memberNames.join(", ")}
            </span>
          </>
        )}
        .
      </>
    );

  case "MEMBER":
    return (
      <>
        <span className="text-sm text-muted-foreground">New member </span>
        <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
        <span className="text-sm text-muted-foreground"> joined the team.</span>
      </>
    );
    case "CLIENT":
    return (
      <>
        <span className="text-sm text-muted-foreground">New client </span>
        <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
        <span className="text-sm text-muted-foreground"> is created.</span>
      </>
    );

  case "EXPENSE":
    return (
      <>
        <span className="text-sm text-muted-foreground">Expense of </span>
        <span className="text-sm font-semibold text-red-600">₹ {meta?.amount}</span>
        <span className="text-sm text-muted-foreground"> added to task </span>
        <span className="text-sm font-medium text-primary">{meta?.taskName}</span>.
      </>
    );
case "INCOME":
    return (
      <>
        <span className="text-sm text-muted-foreground">Income of </span>
        <span className="text-sm font-semibold text-green-600">₹ {meta?.amount}</span>
        <span className="text-sm text-muted-foreground"> added to project </span>
        <span className="text-sm font-medium text-primary">{meta?.projectName}</span>.
      </>
    );
  case "USER":
    return (
      <>
        <span className="text-sm text-muted-foreground">New user account created for </span>
        <span className="text-sm font-semibold text-foreground">{meta?.memberName}</span>.
      </>
    );

  default:
    return <span className="text-sm text-muted-foreground">{JSON.stringify(meta)}</span>;
}


  
};
  return (
   
    <Card className="border-muted-foreground/20 overflow-auto h-[500px] flex flex-col ">
      <CardHeader className="flex-shrink-0 bg-white sticky top-0 z-10">
        <CardTitle className="text-lg font-semibold flex items-center justify-between ">
          <div className="flex items-center gap-2">
          Recent Activity
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
          </div>
           <Button variant="ghost" className="hover:bg-accent" onClick={()=>navigate("/recentDetailed")}>
               
                  <p className="text-xs text-primary">View all...</p>
                
              </Button>
        </CardTitle>
       
      </CardHeader>
      <CardContent className="space-y-4">
        {activityList.map((activity) => (
          <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
             {/* <div className={styles.activityIcon}>
                  {activity.type === 'TASK' && <CheckSquare size={16} />}
                  {activity.type === 'PROJECT' && <FolderOpen size={16} />}
                  {activity.type === 'MEMBER' && <Users size={16} />}
                  {activity.type === 'SUBTASK' && <List size={16} />}
                  {activity.type === 'EXPENSE' && <UserCheck2 size={16} />}
                  {activity.type === 'USER' && <ShieldUser size={20} />}
                </div> */}
            <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2`} />
            <div className="flex-1 min-w-0">
              {/* <p className="text-sm">
                <span className="font-medium text-foreground">{activity.user}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-medium text-foreground">{activity.target}</span>
              </p> */}
              <p>{renderActivityDetails(activity)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.createdAt).toLocaleString('en-IN',{
                                                        day:"numeric",
                                                        month:"short",
                                                        year:"2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                      })}{' '}• {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              {/* {formatDistanceToNow(activity.timestamp, { addSuffix: true })} */}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}