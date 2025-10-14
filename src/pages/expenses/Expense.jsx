import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';

import DataTable from '@/components/Table/DataTable';
import { Edit, Filter, Pencil, Plus, ReceiptIndianRupee, Search, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
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
import API from "@/axios";
import AddExpense from '@/components/models/AddExpense';
import FilterComp from '../../components/filter/FilterComp';
import FilterStatus from '../../components/filter/FilterStatus';
import { StatsCard } from "@/components/dashboard/StatsCard";
function Expense() {
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
            setShowModal(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.original._id);
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
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
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
  const [expenses, setExpenses] = useState([]);
  const [allExpenses,setAllExpenses] = useState([]);
  const [totalExpense,setTotalExpense] = useState(0);
  const {expenseContext,setExpenseContext,projectContext,phaseContext,taskContext} = useData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditExpense] = useState(null);
   const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, expenseId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  useEffect(()=>{
    setExpenses(expenseContext);
    setAllExpenses(expenseContext);
    fetchOptions();
  },[expenseContext])

  useEffect(() => {
    const total = expenses.reduce(
      (sum, expense) => sum + (expense?.amount || 0),
      0
    );
    setTotalExpense(total);
  }, [expenses]);
  
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
    }
   // ✅ Add Task (Backend) +Local state
  const handleAddExpense = async (expenseData) => {
   try {
      const project = projectOptions.find(p=>p.value ===expenseData.projectId);
      const phase = phaseOptions.find(ph=>ph.value===expenseData.phaseId);
      const task = taskOptions.find(t=>t.value===expenseData.taskId);
      const newExpense = {
        ...expenseData,
        projectId:{_id:expenseData?.projectId,name:project?.label || ''},
        phaseId:{_id:expenseData?.phaseId,name:phase?.label || ''},
        taskId:{_id:expenseData?.taskId,name:task?.label || ''},
        
    
      }
      setExpenses(prev => [...prev, newExpense]);
      setAllExpenses(prev => [...prev, newExpense]);
      setExpenseContext(prev=>[...prev,newExpense]);
    } catch (error) {
      console.error("Error adding Expense:", error);
    }
  };

  const handleEditExpense = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      const phase = phaseOptions.find(ph=>ph.value===updated.phaseId);
      const task = taskOptions.find(t=>t.value===updated.taskId);
      const updatedExpense = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
        phaseId:{_id:updated?.phaseId,name:phase?.label || ''},
        taskId:{_id:updated?.taskId,name:task?.label || ''},
        
    
      }

     setExpenses(prev =>
      prev.map((task) => task._id === updated._id ? updatedExpense : task)
    );
    setAllExpenses(prev =>
      prev.map((task) => task._id === updated._id ? updatedExpense :task)
    );
    setExpenseContext(prev =>
      prev.map((task) => task._id === updated._id ? updatedExpense : task)
    );
    setEditExpense(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, expenseId: id })
  }
   //  Delete Expemse (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.expenseId
       setConfirmDialog({ open: false, expenseId: null })
       try{
      
            await API.delete(`/expense/${id}`);
            setExpenses(expenses.filter(expense =>expense._id !== id));
            setAllExpenses(allExpenses.filter(expense =>expense._id !== id));
            setExpenseContext(expenseContext.filter(expense =>expense._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Expense deleted successfully.",
              });         
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
   const handleRowClick = (row) => {
        navigate(`/expense/${row._id}`);
    };
    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

   // Filter the Expenses based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setExpenses(allExpenses); // ✅ show all again
          setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allExpenses];
        const newActiveFilters = {};
       

        if (filters.project) {
          filtered = filtered.filter(
            (p) => p.projectId.name === filters.project
          );
          newActiveFilters.project = filters.project;
        }
        if (filters.phase) {
          filtered = filtered.filter(
            (p) => p.phaseId.name === filters.phase
          );
          newActiveFilters.phase = filters.phase;
        }
        if (filters.task) {
          filtered = filtered.filter(
            (p) => p.taskId.name === filters.task
          );
          newActiveFilters.task = filters.task;
        }
         if (filters.paymentMethod) {
            filtered = filtered.filter(
              (p) => p.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase()
            );
            newActiveFilters.paymentMethod = filters.paymentMethod;
          }
  
        if (filters.category) {
            filtered = filtered.filter(
              (p) =>  filters.category.includes(p.category)
             
            );
            newActiveFilters.category = filters.category;
          }

       
        setExpenses(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };


    
  
  // Filter configuration for tasks
  const expenseFilterConfig = {
    labels: {      
      project: 'Project',   
      status: 'Status'
    },
    fieldTypes: {
      project: 'string',  
      status: 'string'
    },
   
  };
    // Modify clearFilter to also update filterValues
const clearFilter = (filterKey) => {
  const newActiveFilters = { ...activeFilters };
  const newFilterValues = { ...filterValues };
  
  delete newActiveFilters[filterKey];
  delete newFilterValues[filterKey];
  
  setActiveFilters(newActiveFilters);
  setFilterValues(newFilterValues);
  
  applyFilters(newFilterValues);
};


  // Clear all filters
  const clearAllFilters = () => {
    setExpenses(allExpenses);
    setActiveFilters({});
    setFilterValues({});
  };
  const unique = (arr) => [...new Set(arr.filter(Boolean))]; // Removes duplicates & empty
const category = unique(allExpenses.map((e) => e?.category));
  return (
        <div >
          <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search expenses..."
                      value={globalFilter || ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10 bg-accent w-full"
                    />
                  </div>
                </div>
                

                <div className="flex items-center gap-2">
                  <Button mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" onClick={() => setShowModal(true)} >
                    <Plus className="w-4 h-4 mr-2" />
                    New Expense
                  </Button>
                  
                    <FilterComp
                      fields={[
                        // { name: "startDate", label: "Date From", type: "startDate" },
                        // { name: "endDate", label: "Date To", type: "endDate" },
                        { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
                        { name: "phase", label: "Phase", type: "select", options: phaseOptions.map((ph) => ph.label) },
                         { name: "task", label: "Task", type: "select", options: taskOptions.map((t) => t.label) },
                        { name: "paymentMethod", label: "Payment Method", type: "select", options: ["Cash", "GPay", "Others"] },
                        { name: "category", label: "Category", type: "multiselect", options: category},
                        
                      ]}
                      onApplyFilters={(filters) => applyFilters(filters)}
                      initialValues={filterValues}
                    />
                    
                </div>
              
          </div>
          <AddExpense
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditExpense(null);
        }}
        onSubmit={handleAddExpense}
        onEdit={handleEditExpense}
        editExpense={editingExpense}
      />
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={expenseFilterConfig}
                data-page-type="expense"
              />
            <div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Expense"
                        value={formatCurrency(totalExpense)}
                        icon={<ReceiptIndianRupee className="w-5 h-5" />}
                      />
                 
                 </div>
          <DataTable data={expenses} columns={expenseColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
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
        </div>
  )
}

export default Expense
