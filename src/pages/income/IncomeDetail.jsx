import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Building2, Layers, CheckSquare, BookCheck, Tags, ReceiptText } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import AddIncome from "../../components/models/AddIncome";
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
export default function IncomeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incomeContext,setIncomeContext,projectContext,phaseContext } = useData();
  const [income,setIncome] = useState('');
  const [incomeType,setIncomeType]= useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditIncome] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, incomeId: null });

  useEffect(()=>{
    const updatedIncome = incomeContext.find((i) => i._id === id);
    
    setIncome( updatedIncome);
    fetchOptions();
  },[incomeContext,projectContext,phaseContext])
  
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
    } 
  const  formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

    //  Open Edit Modal
  const handleEdit = (income) => {
    setEditIncome(income); // force new reference
    setShowModal(true);
    setIncomeType('edit');
  };
  const handleEditIncome = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
    
      const updatedIncome = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},  
      }
     setIncome(updatedIncome);
    setIncomeContext(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome : income)
    );
    setEditIncome(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
      setConfirmDialog({ open: true, incomeId: id })
    }
     //  Delete Task (Backend)
       const handleDelete =async () => {
        const id = confirmDialog.incomeId
         setConfirmDialog({ open: false, incomeId: null })
         try{
        
              await API.delete(`/income/${id}`);
               setIncomeContext(prev => prev.filter(income => income._id !== id));
              // setIncome(income.filter(income =>income._id !== id));
              
              // setIncomeContext(incomeContext.filter(income =>income._id !== id));
              setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Income deleted successfully.",
                });      
                navigate("/incomes");
           
            
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
  if (!income) return <p className="p-6">Income not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{income?.name}</h1>
          <Badge>{income?.paymentMethod}</Badge>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
          onClick={() => handleEdit(income)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(income._id);
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
               
            <p>Income Id: {income?.customId}</p>
            </div>
             {income?.description&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Description: {income?.description}</p>
            </div>}
           {
            income.phaseId&&<>
            <div className="flex items-center gap-2 ">
                <Layers className="w-4 h-4"/>
                <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/phase/${income.phaseId?._id}`)}>Phase Name: {income?.phaseId?.name}</p>
            </div>
            </>
           } 
          <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${income?.projectId?._id}`)}>Project Name: {income?.projectId?.name}</p>
           </div>
           <div className="flex items-center gap-2 ">
           <ReceiptIndianRupee className="w-4 h-4" />
           <span>Amount: ₹{income?.amount}</span>
            </div>
         
            <div className="flex items-center gap-2 ">
              <Calendar className="w-4 h-4" /> 
              <span>Payment Date: {formatDate(income?.paymentDate)} </span>
            </div>
            {
              income?.transactionNo&&<>
              <div className="flex items-center gap-2 ">
              <ReceiptText className="w-4 h-4" /> 
              <span>Reference: {income?.transactionNo} </span>
            </div>
              </>
            }
            
          

        
        </CardContent>
      </Card>
      <AddIncome
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditIncome(null);
          setIncomeType('');
        }}
         onEdit={handleEditIncome}
         editIncome={editingIncome}
         type={incomeType}
      />
       {/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this income?
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
