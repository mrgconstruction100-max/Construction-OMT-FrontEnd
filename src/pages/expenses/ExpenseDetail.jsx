import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ReceiptIndianRupee, ArrowLeft, Edit, Trash2, Tags, ReceiptText, Layers, Building2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
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
import AddExpense from "../../components/models/AddExpense";
export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenseContext,setExpenseContext,projectContext,phaseContext } = useData();
  const [expense,setExpense] = useState('');
  const [expenseType,setExpenseType] = useState('');
  const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditExpense] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, expenseId: null });
  useEffect(()=>{
    const updatedExpense = expenseContext.find((e) => e._id === id);
    
    setExpense( updatedExpense);
    fetchOptions();
  },[expenseContext])
  
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
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
    //  Open Edit Modal
  const handleEdit = (expense) => {
    setEditExpense(expense); // force new reference
    setShowModal(true);
    setExpenseType('edit');
  };
  const handleEditExpense = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
    
      const updatedExpense = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
    
      }
     setExpense(updatedExpense);
    setExpenseContext(prev =>
      prev.map((expense) => expense._id === updated._id ? updatedExpense : expense)
    );
    setEditExpense(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
      setConfirmDialog({ open: true, expenseId: id })
    }
     //  Delete Task (Backend)
       const handleDelete =async () => {
        const id = confirmDialog.expenseId
         setConfirmDialog({ open: false, expenseId: null })
         try{
        
              await API.delete(`/expense/${id}`);
               setExpenseContext(prev => prev.filter(expense => expense._id !== id));
          
              setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Expense deleted successfully.",
                });      
                navigate("/expenses");
           
            
          }
          catch(err){
              console.error(err);
               setInfoDialog({
                open: true,
                type: "error",
                message: "Failed to delete expense.",
              });
              
            }
       }

  if (!expense) return <p className="p-6">Expense not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{expense.name}</h1>
          <Badge>{expense.paymentMethod}</Badge>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none"
           onClick={() => handleEdit(expense)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive"
           onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(expense._id);
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
               
            <p>Expense Id: {expense?.customId}</p>
            </div>
             {expense?.description&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Description: {expense?.description}</p>
            </div>}
            
          <div className="flex items-center gap-2 ">
             <Building2 className="w-4 h-4"/>
          <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${expense?.projectId?._id}`)}>Project Name: {expense?.projectId?.name}</p>
           </div>
           
            <div className="flex items-center gap-2 ">
                <Layers className="w-4 h-4"/>
         <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/phase/${expense.phaseId?._id}`)}>Phase Name: {expense?.phaseId?.name}</p>
            </div>
             
            <div className="flex items-center gap-2 ">
              <Calendar className="w-4 h-4" /> 
              <span>Payment Date: {formatDate(expense?.paymentDate)} </span>
            </div>
          
        
           
            {expense?.paidTo&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Paid To: {expense?.paidTo}</p>
            </div>}
              {expense?.category&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Category: {expense?.category}</p>
            </div>}
            {expense?.workers&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>No.of Workers: {expense?.workers}</p>
            </div>}
            {expense?.salary&&<div className="flex items-center gap-2 ">
                <ReceiptIndianRupee  className="w-4 h-4"/>
               
             <p>Salary Amount: {formatCurrency(expense?.salary)}</p>
            </div>}
            {expense?.food&&<div className="flex items-center gap-2 ">
                <ReceiptIndianRupee  className="w-4 h-4"/>
               
             <p>Food Amount: {formatCurrency(expense?.food)}</p>
            </div>}
            {expense?.unit&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Unit: {expense?.unit}</p>
            </div>}
            {expense?.quantity&&<div className="flex items-center gap-2 ">
                <ReceiptText  className="w-4 h-4"/>
               
             <p>Quantity: {expense?.quantity}</p>
            </div>}
            {expense?.price&&<div className="flex items-center gap-2 ">
                <ReceiptIndianRupee  className="w-4 h-4"/>
               
             <p>Unit Price: {formatCurrency(expense?.price)}</p>
            </div>}
            
            {expense?.miscellaneous&&<div className="flex items-center gap-2 ">
                <ReceiptIndianRupee  className="w-4 h-4"/>
               
             <p>Miscellaneous Amount: {formatCurrency(expense?.miscellaneous)}</p>
            </div>}
             <div className="flex items-center gap-2 ">
           <ReceiptIndianRupee className="w-4 h-4" />
           <span>Total Amount: {formatCurrency(expense?.amount)}</span>
            </div>

        </CardContent>
      </Card>
      <AddExpense
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditExpense(null);
          setExpenseType('');
        }}
         onEdit={handleEditExpense}
         editExpense={editingExpense}
         type={expenseType}
      />
       {/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this expense?
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
