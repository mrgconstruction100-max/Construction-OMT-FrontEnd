import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  ReceiptIndianRupee, 
  Edit, 
  Trash2,  
  Tags, 
  Phone, 
  Mail, 
  Briefcase, 
  MapPin 
} from "lucide-react";
import DataTable from '@/components/Table/DataTable';
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import AddMember from "../../components/models/AddMember";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
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
export default function MemberDetail() {
  
    const tasksColumns =[
  //  
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberContext,setMemberContext,projectContext,taskContext} = useData();
 const [member,setMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditMember] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, memberId: null });
 

  //Tasks

   const [tasks,setTasks]=useState([]); // filtered data
  const [globalFilter, setGlobalFilter] = useState('');
   const [view,setView] = useState('card');
     const handleToggle = (newView) => {
      setView(newView);
    };

  useEffect(()=>{
    const updatedMember = memberContext.find((i) => i._id === id); 
    if(!updatedMember) {
    setMember(null);
    setTasks([]);
    return;
  }
    setMember( updatedMember);
    const filteredTasks = taskContext.filter((task)=> task.assignedTo?.some(member => String(member._id) === String(updatedMember._id)))
    
    setTasks(filteredTasks);
  },[memberContext,taskContext])
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
    //  Open Edit Modal
  const handleEdit = (member) => {
    setEditMember(member); // force new reference
    setShowModal(true);
  };
  const handleEditMember = async(updated) => {
     
     setMember(updated);
    setMemberContext(prev =>
      prev.map((member) => member._id === updated._id ? updated : member)
    );
    setEditMember(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
      setConfirmDialog({ open: true, memberId: id })
    }
     //  Delete Member (Backend)
       const handleDelete =async () => {
        const id = confirmDialog.memberId
         setConfirmDialog({ open: false, memberId: null })
         try{
              const filteredProjects = projectContext.filter((project) => String(project.projectManager._id) === String(id) );
          const filteredTasks = taskContext.filter((task) => task.assignedTo.some((member) => String(member._id) === String(id)) );
          if(filteredProjects.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "He is working in Project. You can't delete him.",
                });
            return;
          }
           if(filteredTasks.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "He is working in tasks. You can't delete him.",
                });
            return;
          }
              await API.delete(`/member/${id}`);
               setMemberContext(prev => prev.filter(member => member._id !== id));

              setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Member deleted successfully.",
                });      
                navigate("/members");
           
            
          }
          catch(err){
              console.error(err);
               setInfoDialog({
                open: true,
                type: "error",
                message: "Failed to delete member.",
              });
              
            }
       }
  if (!member) return <p className="p-6">Member not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{member?.name}</h1>
          <Badge>{member?.role}</Badge>
        </div>
        <div className="flex gap-2">
         
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(member)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(member._id);
          }}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="space-y-4 p-3">
            {/* <div className="flex items-center gap-2 ">
                <Tags   className="w-4 h-4"/>
               
            <p>Member Id: {member?.customId}</p>
            </div> */}
             {/* <div className="flex items-center gap-2 ">
                 <Calendar className="w-4 h-4" /> 
               
             <p>Date Of Birth: {new Date(member?.dateOfBirth ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
                })}</p>
            </div> */}
            
           <div className="flex items-center gap-2 ">
                <Phone   className="w-4 h-4"/>
               
            <p>Phone Number: {member?.phone}</p>
            </div>
            <div className="flex items-center gap-2 ">
                <Mail   className="w-4 h-4"/>
               
            <p>Email: {member?.personalEmail}</p>
            </div>
              {/* <div className="flex items-center gap-2 ">
                <Tags   className="w-4 h-4"/>
               
            <p>Marital Status: {member?.maritalStatus}</p>
            </div> */}
                 <div className="flex items-center gap-2 ">
                <Briefcase   className="w-4 h-4"/>
               
            <p>Role: {member?.role}</p>
            </div>
             {/* <div className="flex items-center gap-2 ">
                <Tags   className="w-4 h-4"/>
               
            <p>Skills: {member?.skills}</p>
            </div> */}
             <div className="flex items-center gap-2 ">
                <MapPin   className="w-4 h-4"/>
               
            <p>Address: {member?.address}</p>
            </div>

        
        </CardContent>
      </Card>

      {tasks.length>0&&
      <div className="space-y-6 ">
         <div className="flex items-center justify-between px-4">
             <h1 className="text-2xl font-bold">{`Related Tasks (${tasks.length}) `} </h1>    
             <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
            
                </div>

     <div className="mt-16 space-y-6">
      {view === 'table' &&
        <>
            <div>
          <DataTable data={tasks} columns={tasksColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
        </>
      }
        {/* Projects Grid */}
        {view === 'card' &&
       <>
       
  
        
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
                    <span className="font-medium text-foreground">{task.assignedTo?.map((m) => (
                    <Badge key={m._id}  style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${m?._id}`)}> {m.name}</Badge>
              ))}</span>
                  </div>
                  
                </div>

              
             
              </CardContent>
            </Card>
          ))}
        </div>
        </>
        
}
 
</div>  
      </div>}
      <AddMember
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMember(null);
        }}
         onEdit={handleEditMember}
         editMember={editingMember}
      />
       {/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this member?
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
