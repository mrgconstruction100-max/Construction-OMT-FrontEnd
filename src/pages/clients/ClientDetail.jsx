import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Building2, Layers, CheckSquare, BookCheck, Tags, ReceiptText, Mail, Phone, List, MapPin, User } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import AddClient from "../../components/models/AddClients";
import ViewToggleSwitch from "@/components/Toggle/ViewToggleSwitch";
import { Progress } from "@/components/ui/progress";
import DataTable from "@/components/Table/DataTable";
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
export default function ClientDetail() {
   const projectColumns =[
   
   {
    accessorKey: 'customId',
    header: 'Project ID',
   
  },
  {
    accessorKey: 'name',
    header: 'Project title',
    
  },
    {
    accessorKey: 'clientId',
    header: 'Client',
     cell: info => {
      const member = info.getValue();
      return member?.name || 'N/A'; // ✅ Display member name instead of object
    },
  }, 
   {
    accessorKey: 'projectManager',
    header: 'Project Manager',
     cell: info => {
      const member = info.getValue();
      return member?.name || 'N/A'; // ✅ Display member name instead of object
    },
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
   
   cell: info =>
      { const val = info.getValue();
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
        'Delayed': '#fa7000ff',
        'Cancelled': '#f72525ff'

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
    accessorKey: 'location',
    header: 'Location',
    
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size:200,
   
    cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  },
]
  const { id } = useParams();
  const navigate = useNavigate();
  const { clientContext,setClientContext,projectContext,phaseContext,expenseContext,taskContext,memberContext,incomeContext } = useData();
  const [client,setClient] = useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditClient] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, clientId: null });

  //Project

   const [projects,setProjects]=useState([]); // filtered data
  const [globalFilter, setGlobalFilter] = useState('');
   const [view,setView] = useState('card');
     const handleToggle = (newView) => {
      setView(newView);
    };
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
    case 'In Progress': return "bg-blue-500 text-white";
    case 'Delayed': return "bg-orange-500 text-white";
    case 'Completed': return "bg-green-500 text-white";
    case "Planning": return "bg-yellow-500 text-black";
    case 'On Hold': return "bg-red-500 text-white";
    case 'Cancelled': return "bg-red-600 text-white";
    default: return "bg-gray-300 text-black";
  }
};

  useEffect(()=>{
    const updatedClient = clientContext.find((i) => i._id === id);
    
    setClient( updatedClient);
    if(!updatedClient) {
    setClient(null);
    setProjects([]);
    return;
  }
   const filteredProjects = projectContext.filter((project)=> String(project.clientId?._id) === String(updatedClient._id))
    const updatedProjects = filteredProjects.map((project) => {
    
       const projectTasks = taskContext.filter(
        (task) => String(task?.projectId?._id) === String(project?._id)
      );

      const projectPhases = phaseContext.filter(
        (phase) => String(phase?.projectId?._id) === String(project?._id)
      );

      const completedTasks = projectTasks.filter(task=> String(task?.status)==="Completed");
      let progress=0;
       if (projectTasks?.length > 0) {
          progress = (completedTasks?.length / projectTasks?.length) * 100;
        }

        // round to 1 decimal place
        progress = Number(progress.toFixed(1));
      const expenseProjects = expenseContext.filter(
        (expense) => String(expense?.projectId?._id) === String(project?._id)
      );
       const incomeProjects = incomeContext.filter(
        (income) => String(income?.projectId?._id) === String(project?._id)
      ); 
      const totalBudget = projectPhases.reduce(
        (sum, phase) => sum + (phase?.budget || 0),
        0
      );

      const spent = expenseProjects.reduce(
        (sum, expense) => sum + (expense?.amount || 0),
        0
      );
      const revenue = incomeProjects.reduce(
        (sum, income) => sum + (income?.amount || 0),
        0
      );

      return {
        ...project,
        budget: totalBudget,
        spent,
        revenue,
        variance: totalBudget - spent,
        progress,
        pending:totalBudget-revenue,
      };
    });


    setProjects(updatedProjects);
  },[clientContext,projectContext,taskContext,memberContext,expenseContext])
  
   const handleRowClick = (row) => {
        navigate(`/project/${row._id}`);
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
  const handleEdit = (client) => {
    setEditClient(client); // force new reference
    setShowModal(true);
  };
  const handleEditClient = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
      const updatedClient = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
        
    
      }
     setClient(updatedClient);
    setClientContext(prev =>
      prev.map((client) => client._id === updated._id ? updatedClient : client)
    );
    setEditClient(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
      setConfirmDialog({ open: true, clientId: id })
    }
     //  Delete Task (Backend)
       const handleDelete =async () => {
        const id = confirmDialog.clientId
         setConfirmDialog({ open: false, clientId: null })
         try{
        
            const filteredProjects = projectContext.filter((project) =>  String(project?.clientId?._id) === String(id));
          if(filteredProjects.length>0){
               setInfoDialog({
                  open: true,
                  type: "error",
                  message: "Project is created for this client. You can't delete.",
                });
            return;
          }
              await API.delete(`/client/${id}`);
               setClientContext(prev => prev.filter(client => client._id !== id));
              // setClient(client.filter(client =>client._id !== id));
              
              // setClientContext(clientContext.filter(client =>client._id !== id));
              setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Client deleted successfully.",
                });      
                navigate("/clients");
           
            
          }
          catch(err){
              console.error(err);
               setInfoDialog({
                open: true,
                type: "error",
                message: "Failed to delete client.",
              });
              
            }
       }
  if (!client) return <p className="p-6">Client not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client?.name}</h1>
          <Badge>{client?.paymentMethod}</Badge>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(client)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(client._id);
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
               
            <p>Client Id: {client?.customId}</p>
            </div>
             <div className="flex items-center gap-2 ">
                <List   className="w-4 h-4"/>
               
            <p>Description: {client?.description}</p>
            </div>
         
           <div className="flex items-center gap-2 ">
                <Phone   className="w-4 h-4"/>
               
            <p>Phone Number: {client?.phone}</p>
            </div>
            <div className="flex items-center gap-2 ">
                <Mail   className="w-4 h-4"/>
               
            <p>Email: {client?.email}</p>
            </div>
             
             <div className="flex items-center gap-2 ">
                <MapPin   className="w-4 h-4"/>
               
            <p>Address: {client?.address}</p>
            </div>

        
        </CardContent>
      </Card>
            {projects.length>0&&
      <div className="space-y-6 ">
         <div className="flex items-center justify-between px-4">
             <h1 className="text-2xl font-bold">{`Related Project  `} </h1>    
             <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
            
                </div>

     <div className="mt-16 space-y-6">
      {view === 'table' &&
        <>
            <div>
          <DataTable data={projects} columns={projectColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
        </>
      }
        {/* Projects Grid */}
        {view === 'card' &&
      <>
     
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {projects.filter(project => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            project.name?.toLowerCase().includes(search) ||
             project.typeId?.toLowerCase().includes(search)

          );
        }).map((project) => (
            <Card key={project._id} className="border-muted-foreground/20 hover:shadow-elevated transition-smooth group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {project.name}
                    </CardTitle>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
              
                </div>
                 
              </CardHeader>
           
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress}  mode="progress" className="h-2" />
                </div>

                {/* Project Details */}
                <div className="space-y-2 text-sm">
                     <div className="flex items-center gap-2 text-muted-foreground">
                    <Tags className="w-4 h-4" />
                    <span>Project Id:</span>
                    <span className="font-medium text-foreground"> {project?.typeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4"/>
                    <span>Project Manager:</span>
                    <span className="font-medium text-foreground"> {project?.projectManager?.name} </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Allocated Budget:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project.budget)} </span>
                  </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
             
                    <span>Client Payments:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project?.revenue)} </span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    
                    <span>Expenditure:</span>
                    <span className="font-medium text-foreground"> {formatCurrency(project?.spent)} </span>
                  </div>
                 
                      {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="font-medium">
                        {formatCurrency(project?.spent)} / {formatCurrency(project?.budget)}
                      </span>
                    </div>
                    <Progress spent={project?.spent} budget={project?.budget} mode="budget" className="h-2" />
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Budget Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(project?.variance)}</span>
                  </div>
                        {/*profit Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Return Ratio</span>
                      <span className="font-medium">
                        {formatCurrency(project?.spent)} / {formatCurrency(project?.revenue)}
                      </span>
                    </div>
                   
                     <Progress spent={project?.spent} budget={project?.revenue} mode="budget" className="h-2" />
                  </div>
                
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptIndianRupee className="w-4 h-4" />
                    <span>Pending from Clients:</span>
                    <span className="font-medium text-foreground">{formatCurrency(project?.pending)}</span>
                  </div>
                </div>

                {/* Client */}
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium text-sm">{project?.clientId?.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
        
}
 
</div>  
      </div>}
      <AddClient
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditClient(null);
        }}
         onEdit={handleEditClient}
         editClient={editingClient}
      />
       {/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this client?
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
