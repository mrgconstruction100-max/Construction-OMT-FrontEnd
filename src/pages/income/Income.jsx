
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';

import DataTable from '@/components/Table/DataTable';
import { Edit, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
import AddIncome from '@/components/models/AddIncome';
import FilterComp from '../../components/filter/FilterComp';
import FilterStatus from '../../components/filter/FilterStatus';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
function Income() {
  const incomeColumns =[
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
            setEditIncome(row.original); // pass whole row data
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
    header: 'Income ID',
  },
  {
    accessorKey: 'name',
    header: 'Income ',
    cell: info => info.getValue()?.toString().slice(0, 20) || '-', // truncate if long
  },
    {
    accessorKey: 'amount',
    header: 'Amount ',
     cell: info => {
      const amount = info.getValue();
      return formatCurrency(amount) || 'N/A'; // ✅ Display task name instead of object
    },
  },
  
  // {
  //   accessorKey: 'phaseId',
  //   header: 'Phase ',
  //   cell: info => {
  //     const phase = info.getValue();
  //     return phase?.name|| 'N/A'; // ✅ Display task name instead of object
  //   },
  // },
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
    accessorKey: 'transactionNo',
    header: 'Reference No',
    cell: info => info.getValue()?.toString().slice(0, 20) || '-', // truncate if long
  },
 

 
]
  const [incomes, setIncomes] = useState([]);
  const [allIncomes,setAllIncomes] = useState([]);
  const {incomeContext,setIncomeContext,projectContext,phaseContext,taskContext} = useData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditIncome] = useState(null);
   const [projectOptions,setProjectOptions]= useState([]);
  const [phaseOptions,setPhaseOptions] =useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, incomeId: null });
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  useEffect(()=>{
    setIncomes(incomeContext);
    setAllIncomes(incomeContext);
    fetchOptions();
  },[incomeContext])

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
   // ✅ Add Income (Backend) +Local state
  const handleAddIncome = async (incomeData) => {
   try {
      const project = projectOptions.find(p=>p.value ===incomeData.projectId);
      
      const newIncome = {
        ...incomeData,
        projectId:{_id:incomeData?.projectId,name:project?.label || ''},
 
      }
      setIncomes(prev => [...prev, newIncome]);
      setAllIncomes(prev => [...prev, newIncome]);
      setIncomeContext(prev=>[...prev,newIncome]);
    } catch (error) {
      console.error("Error adding Income:", error);
    }
  };

  const handleEditIncome = async(updated) => {
     
     const project = projectOptions.find(p=>p.value ===updated.projectId);
      
      const updatedIncome = {
        ...updated,
        projectId:{_id:updated?.projectId,name:project?.label || ''},
      }

     setIncomes(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome : income)
    );
    setAllIncomes(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome :income)
    );
    setIncomeContext(prev =>
      prev.map((income) => income._id === updated._id ? updatedIncome : income)
    );
    setEditIncome(null);
    setShowModal(false);
  };
  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, incomeId: id })
  }
   //  Delete Income (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.incomeId
       setConfirmDialog({ open: false, incomeId: null })
       try{
        
            await API.delete(`/income/${id}`);
            setIncomes(incomes.filter(income =>income._id !== id));
            setAllIncomes(allIncomes.filter(income =>income._id !== id));
            setIncomeContext(incomeContext.filter(income =>income._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "Income deleted successfully.",
              });         
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
   const handleRowClick = (row) => {
        navigate(`/income/${row._id}`);
    };
    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

   // Filter the Incomes based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setIncomes(allIncomes); // ✅ show all again
          setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allIncomes];
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
       
         if (filters.paymentMethod) {
            filtered = filtered.filter(
              (p) => p.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase()
            );
            newActiveFilters.paymentMethod = filters.paymentMethod;
          }
        

       
        setIncomes(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };


    
  
  // Filter configuration for tasks
  const incomeFilterConfig = {
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
    setIncomes(allIncomes);
    setActiveFilters({});
    setFilterValues({});
  };
  return (
        <div >
          <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search incomes..."
                      value={globalFilter || ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10 bg-accent w-full"
                    />
                  </div>
                </div>
                

                <div className="flex items-center gap-2">
                  <Button mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" onClick={() => setShowModal(true)} >
                    <Plus className="w-4 h-4 mr-2" />
                    New Income
                  </Button>
                  
                    <FilterComp
                      fields={[
                        // { name: "startDate", label: "Date From", type: "startDate" },
                        // { name: "endDate", label: "Date To", type: "endDate" },
                        { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
                        // { name: "phase", label: "Phase", type: "select", options: phaseOptions.map((ph) => ph.label) },
                        { name: "paymentMethod", label: "Payment Method", type: "select", options: ["Cash", "GPay", "Others"] },
                        
                        
                      ]}
                      onApplyFilters={(filters) => applyFilters(filters)}
                      initialValues={filterValues}
                    />
                    
                </div>
              
          </div>
          <AddIncome
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditIncome(null);
        }}
        onSubmit={handleAddIncome}
        onEdit={handleEditIncome}
        editIncome={editingIncome}
      />
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={incomeFilterConfig}
                data-page-type="income"
              />
            <div></div>
          <DataTable data={incomes} columns={incomeColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
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
        </div>
  )
}

export default Income
