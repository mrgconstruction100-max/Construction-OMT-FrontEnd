import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import API from "../../axios";

const ITEMS_PER_PAGE = 20;

export default function RecentActivityDetailPage() {
  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchActivityList();
   document.querySelector('.card-content').scrollTop = 0;
}, [currentPage]);

  const fetchActivityList = async () => {
  try {
    const res = await API.get(`/activityList?page=${currentPage}&limit=20`);
    // Backend response: { activities: [...], totalPages: x, currentPage: y }
    setActivityList(res.data.activities); // <-- set the array here
    setTotalPages(res.data.totalPages);
    setCurrentPage(res.data.currentPage);
  } catch (error) {
    console.error("Error fetching ActivityList:", error);
  } finally {
    setLoading(false);
  }
};


  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-8">

    
    <Card className="border-muted-foreground/20 h-[700px]  flex flex-col">
      <CardHeader className="flex-shrink-0 bg-white sticky top-0 z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Recent Activities
            <Badge variant="secondary" className="text-xs">All</Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-auto flex-1 space-y-4 card-content">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) :activityList.length === 0 ? (
          <p className="text-center text-muted-foreground">No activities found</p>
        ) : (
         activityList.map((activity) => (
            <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2`} />
              <div className="flex-1 min-w-0">
                <p>{renderActivityDetails(activity)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Pagination Buttons */}
      <div className="flex justify-between items-center p-3 border-t border-muted-foreground/20">
        <Button variant="default" onClick={handlePrev} disabled={currentPage === 1}>
         ← Prev
        </Button>
        {/* <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span> */}
            <div className="pagination-info ">
                    <span className="text-sm px-3 ">
                       Page {currentPage} of {totalPages}
                    </span>
                   <select
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        aria-label="Go to page"
                        disabled={loading}
                        className="border border-muted-foreground/50 rounded-md px-3 py-1 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {Array.from({ length: totalPages }, (_, i) => (
                            <option key={i} value={i+1}>
                               {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
        
        <Button variant="default" onClick={handleNext} disabled={currentPage === totalPages}>
          Next →
        </Button>
      </div>
    </Card>
    </div>
  );
}

// Helper function for activity badge colors
const getActivityColor = (type) => {
  switch (type) {
    case "PROJECT": return "bg-primary text-primary-foreground";
    case "TASK": return "bg-success text-success-foreground";
    case "MEMBER": return "bg-secondary text-secondary-foreground";
    case "CLIENT": return "bg-orange-400 text-secondary-foreground"; 
    case "PHASE": return "bg-purple-500 text-white";
    case "EXPENSE": return "bg-red-500 text-white";
    case "USER": return "bg-teal-500 text-white";
    case "INCOME": return "bg-green-700 text-white";  
    default: return "bg-muted text-muted-foreground";
  }
};

// Helper to render activity details (same as your RecentActivity component)
const renderActivityDetails = (activity) => {
  const { type, meta } = activity;
  switch (type) {
    case "PROJECT": return <>New project <span className="font-semibold">{meta?.name}</span> created for client <span className="font-medium text-primary">{meta?.clientName}</span>.</>;
    case "PHASE": return <>Phase <span className="font-semibold">{meta?.name}</span> added to project <span className="font-medium text-primary">{meta?.projectName}</span>.</>;
    case "TASK": return <>Task <span className="font-semibold">{meta?.name}</span> created under phase  <span className="font-medium text-primary">{meta?.phaseName}</span>{meta?.memberNames?.length > 0 && <> and assigned to <span className="font-medium text-secondary">{meta.memberNames.join(", ")}</span></>}.</>;
    case "MEMBER": return <>New member <span className="font-semibold">{meta?.name}</span> joined the team.</>;
    case "CLIENT": return <>New client <span className="font-semibold">{meta?.name}</span> created.</>;
    case "EXPENSE": return <>Expense of <span className="font-semibold text-red-600">₹{meta?.amount}</span> added to phase <span className="font-medium text-primary">{meta?.phaseName}</span>.</>;
    case "INCOME": return <>Income of <span className="font-semibold text-green-600">₹{meta?.amount}</span> added to project <span className="font-medium text-primary">{meta?.projectName}</span>.</>;
    case "USER": return <>New user account created for <span className="font-semibold">{meta?.memberName}</span>.</>;
    default: return <span>{JSON.stringify(meta)}</span>;
  }
};
