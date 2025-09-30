import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
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
import DataTable from '@/components/Table/DataTable';
import { Edit, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import AddUser from '../../components/models/AddUser';
import API from '../../axios';
function UserList() {
    const expenseColumns =[
//    {
//     id: "actions",
//     header: "Actions",
//     size:150,
//     cell: ({ row }) => (
//       <div className="flex gap-2">
//         {/* <Button
//           size="icon"
//           variant="default"
//           onClick={(e) => {
//             e.stopPropagation(); // prevent row click navigation
//             setEditUser(row.original); // pass whole row data
//             setShowModal(true);
//           }}
//         >
//           <Edit className="w-4 h-4" />
//         </Button> */}
//         <Button
//           size="icon"
//           variant="destructive"
//           onClick={(e) => {
//             e.stopPropagation();
//             handleDeleteClick(row.original._id);
//           }}
//         >
//           <Trash2 className="w-4 h-4" />
//         </Button>
//       </div>
//     ),
//   },
    {
    accessorKey: 'customId',
    header: 'Custom ID',
    size:200,
  },
      {
    accessorKey: 'memberId',
    header: 'Member Name',
    
    cell: info => {
      const member = info.getValue();
      return member?.name || 'N/A'; 
    },
  },
  {
    accessorKey: 'username',
    header: 'Username ',
  },
  {
    accessorKey: 'role',
    header: 'Role ',
    
  },

  

 
]
const [userList,setUserList] = useState([]);
  const [allUserList, setAllUserList] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditUser] = useState(null);
  const {allUserContext,setAllUserContext,expenseContext,setExpenseContext,projectContext,phaseContext,taskContext} = useData();
    const [memberOptions,setMemberOptions]= useState([]);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, expenseId: null });
//   const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
//   const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  useEffect(()=>{
    setUserList(allUserContext);
    setAllUserList(allUserContext);
  },[allUserContext])
  const handleRowClick = (row) => {
        navigate(`/user/${row._id}`);
    };
       const handleAddUser = async (userData) => {
    try {
      const member= memberOptions.find(m=>m.value ===userData.memberId);

      const newUser = {
        ...userData,
        memberId:{_id:userData?.memberId,name:member?.label || ''}
      }
      setUserList(prev => [...prev, newUser]);
      setAllUserList(prev => [...prev, newUser]);
      setAllUserContext(prev=>[...prev,newUser]);
    } catch (error) {
      console.error("Error adding User:", error);
    }
  };
  // ✅ Update Phase in front end for quick response
    const handleEditUser = async(updated) => {
        const member= memberOptions.find(m=>m.value ===updated.memberId);

        const updatedUser ={
          ...updated,
          memberId:{_id:updated?.memberId,name:member?.label || ''}
        }
        setUserList(prev =>
          prev.map((user) => user._id === updated._id ? updatedUser : user)
        );
       setAllUserList(prev =>
          prev.map((user) => user._id === updated._id ? updatedUser : user)
        );
        setAllUserContext(prev =>
          prev.map((user) => user._id === updated._id ? updatedUser : user)
        );
      setEditUser(null);
      setShowModal(false);
  };

 
  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, userId: id })
  }
   //  Delete Phase (Backend)
     const handleDelete =async () => {
      const id = confirmDialog.userId
       setConfirmDialog({ open: false, userId: null })
       try{
        //   const res =await API.get(`/task`);
        //   const filteredTasks = res.data.data.filter((task) => String(task.phaseId._id) === String(id) );
        //   if(filteredTasks.length>0){
        //        setInfoDialog({
        //           open: true,
        //           type: "error",
        //           message: "This Phase is used for creating tasks. You can't delete it.",
        //         });
        //     return;
        //   }
         
          
            
            await API.delete(`/auth/${id}`);
            setUserList(userList.filter(user => user._id !== id));
            setAllUserList(allUserList.filter(user => user._id !== id));
            setAllUserContext(allUserContext.filter(user=> user._id !== id));
            setInfoDialog({
                open: true,
                type: "success",
                message: "User deleted successfully.",
              });         
        }
        catch(err){
            console.error(err);
             setInfoDialog({
              open: true,
              type: "error",
              message: "Failed to delete user.",
            });
            
          }
     }

  return (
      <div >
          <div className="sticky top-12 z-50 flex  justify-between items-center border-b border-border bg-card/80 backdrop-blur-sm w-full  pe-6 ps-4  py-4">

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center ">
                    <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search Users..."
                      value={globalFilter || ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10 bg-accent w-full"
                    />
                  </div>
                </div>
                

                <div className="flex items-center gap-2">
                  <Button mobileFloating className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-construction flex-1 sm:flex-none" onClick={() => setShowModal(true)} >
                    <Plus className="w-4 h-4 mr-2" />
                    New User
                  </Button>
                  
                    {/* <FilterComp
                      fields={[
                        // { name: "startDate", label: "Date From", type: "startDate" },
                        // { name: "endDate", label: "Date To", type: "endDate" },
                        { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
                        { name: "user", label: "Phase", type: "select", options: phaseOptions.map((ph) => ph.label) },
                         { name: "task", label: "Task", type: "select", options: taskOptions.map((t) => t.label) },
                        { name: "paymentMethod", label: "Payment Method", type: "select", options: ["Cash", "GPay", "Others"] },
                        { name: "category", label: "Category", type: "select", options: ["Travel", "Food", "Office","Salary","Materials","Miscellaneous"] },
                        
                      ]}
                      onApplyFilters={(filters) => applyFilters(filters)}
                      initialValues={filterValues}
                    /> */}
                    
                </div>
              
          </div>
          <AddUser
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditUser(null);
        }}
        onSubmit={handleAddUser}
        onEdit={handleEditUser}
        editUser={editingUser}
      />
<div className="space-y-6 px-6">
     <div className="mt-16 space-y-6">
      {/* <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={expenseFilterConfig}
                data-page-type="expense"
              /> */}
            <div></div>
          <DataTable data={userList} columns={expenseColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
        {/* Confirm Delete AlertDialog */}
                  <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this User?
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

export default UserList
