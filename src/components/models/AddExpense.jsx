import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddExpense({ isOpen, onClose, onSubmit, editExpense, onEdit,selectedTask,selectedProject,selectedPhase }) {
    const [formData,setFormData]=useState({
        name:"",
        description:"",
        paymentDate:null,
        paymentMethod:"",
        paidTo:"",
        projectId:"",
        phaseId:"",
        taskId:"",
        amount:"",
        category:"",
        transactionNo:"",

       
    });
    const [allPhases,setAllPhases] = useState([]);
    const [allTasks,setAllTasks] = useState([]);
    const [projectOptions,setProjectOptions] = useState([]);
    const [phaseOptions,setPhaseOptions] = useState([]);
    const [taskOptions,setTaskOptions] = useState([]);
    const {projectContext,phaseContext,taskContext,expenseContext} = useData();
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);
    const [category, setCategory] = useState([]);

    useEffect(()=>{
      setProjectOptions(projectContext.map(project=>({
          value:project._id,
          label:project.name,
        })));
       setAllPhases(phaseContext.map(phase=>({
          value:phase._id,
          label:phase.name,
          projectId: phase.projectId?._id || phase.projectId,
        })));
        setAllTasks(taskContext.map(task=>({
            value:task._id,
            label:task.name,
            phaseId: task.phaseId?._id || task.phaseId,
        })))
      
    
   },[projectContext,phaseContext,taskContext]);

   useEffect(() => {
       const uniqueCategory = [...new Set(expenseContext.map(e => e.category).filter(Boolean))];
       const defaultCategory = ["Travel", "Food", "Salary","Materials","Miscellaneous"] ;
       const combinedCategory =[...new Set([...defaultCategory,...uniqueCategory])];
        setCategory(combinedCategory);
    }, [expenseContext]);

   useEffect(() => {
    if (!editExpense && !selectedProject && allTasks.length === 0) return;
      let projectFromEdit='';
      let phaseFromEdit='';
      let taskFromEdit='';
        if (editExpense) {
           projectFromEdit = editExpense?.projectId?._id || editExpense?.projectId;
           phaseFromEdit = editExpense?.phaseId?._id || editExpense?.phaseId;
           taskFromEdit =  editExpense?.taskId?._id || editExpense?.taskId;
          }
          else{
            projectFromEdit=selectedProject?._id || '';
            phaseFromEdit=selectedPhase?._id || '';
            taskFromEdit=selectedTask?._id || '';
          }  // Filter phases for the selected project
            const filteredPhases = allPhases.filter(phase => {
              const pid = typeof phase.projectId === 'object' ? phase.projectId._id : phase.projectId;
              return pid === projectFromEdit;
            });
            setPhaseOptions(filteredPhases);
            // Filter tasks for the selected phase ✅
            const filteredTasks = allTasks.filter(task => {
              const tid = typeof task.phaseId === "object" ? task.phaseId._id : task.phaseId;
              return tid === phaseFromEdit;
            });
            setTaskOptions(filteredTasks);

             if (editExpense) {      
            setFormData({
              name:editExpense.name || "",
              description: editExpense.description || "",
              paymentDate: editExpense.paymentDate ? new Date(editExpense.paymentDate) : null,
              paymentMethod: editExpense.paymentMethod || "",
              paidTo: editExpense.paidTo || "",
              projectId: projectFromEdit,
              phaseId: phaseFromEdit,
              taskId: taskFromEdit, // ✅ was `taskContext`
              amount: editExpense.amount || "",
              category: editExpense.category || "",
              transactionNo:editExpense.transactionNo ||"",
            });
        } else {
          setFormData({
            name:"",
            description:"",
            paymentDate:null,
            paymentMethod:"",
            paidTo:"",
            projectId:selectedProject? selectedProject._id : '',
            phaseId:selectedPhase? selectedPhase._id : '',
            taskId:selectedTask ? selectedTask._id : '',
            amount:"",
            category:"",
            transactionNo:"",
           
          });
        }
      }, [editExpense,selectedTask, selectedProject,selectedPhase, allPhases, allTasks]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Expense detail is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.taskId) newErrors.taskId = 'Task is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.phaseId) newErrors.phaseId = 'Phase is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment Method is required';

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e) => {
         e.preventDefault();
         if(btnLoading){
        return
      }
            if (validateForm()) {
              setBtnLoading(true);
               const payload = {
                      ...formData,
                      paymentDate: formData.paymentDate ? formData.paymentDate.toISOString().split("T")[0] : "",
                     
                    };
                if (editExpense) {
                  const res=await API.put(`/expense/${editExpense._id}`, payload);
                    onEdit?.(res.data.data);
                    
                } else {
                     const response = await API.post("/expense",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.data);
                      
                       }
                    
       
                setFormData({
                        name:"",
                        description:"",
                        paymentDate:null,
                        paymentMethod:"",
                        paidTo:"",
                        projectId:"",
                        phaseId:"",
                        taskId:"",
                        amount:"",
                        category:"",
                        transactionNo:"",
                       
     
                });
                setErrors({});
                onClose();
                setBtnLoading(false);
            }
        };
        const handleCancel = () => {
            setFormData({
            name:"",
            description:"",
            paymentDate:null,
            paymentMethod:"",
            paidTo:"",
            projectId:"",
            phaseId:"",
            taskId:"",
            amount:"",
            category:"",
            transactionNo:"",
          
            });
            setErrors({});
            onClose();
  };
  const handleProjectChange = (projectId) => {
    const filtered = allPhases.filter(phase => {
    const pid = typeof phase.projectId === 'object' ? phase.projectId._id : phase.projectId;
    return pid === projectId;
  });
    setPhaseOptions(filtered);
    setTaskOptions([]); // reset tasks since phase will change
   
    setFormData(prev => ({
      ...prev,
      projectId,
      phaseId:'',
      taskId:"",
    }));
  };
  const handlePhaseChange = (phaseId) => {
  const filteredTasks = allTasks.filter(task => {
    const tid = typeof task.phaseId === "object" ? task.phaseId._id : task.phaseId;
    return tid === phaseId;
  });

  setTaskOptions(filteredTasks);

  setFormData(prev => ({
    ...prev,
    phaseId,
    taskId: "" // reset task when phase changes
  }));
};
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>

                                        <FormInput
                                        label="Expense "
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter Expense title"
                                        required
                                        error={errors.name}
                                      
                                        />
                                        <FormInput
                                        label="Description "
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter Expense Details"
                                        multiline
                                        />
                                       

                                       

                                         <DropdownSelect
                                            label="Project Name"
                                            options={projectOptions}
                                            value={formData.projectId}
                                            onChange={(value) =>  {handleProjectChange(value)}}
                                            searchable
                                            required
                                            error={errors.projectId}
                                            disabled={!!selectedProject}
                                          />
                                          <DropdownSelect
                                            label="Phase Name"
                                            options={phaseOptions}
                                            value={formData.phaseId}
                                            onChange={(value) =>handlePhaseChange(value)}
                                            searchable
                                            required
                                            error={errors.phaseId}
                                            disabled={!!selectedPhase}
                                          />
                                          
                                            <DropdownSelect
                                            label="Task Name"
                                            options={taskOptions}
                                            value={formData.taskId}
                                            onChange={(value) => setFormData({ ...formData, taskId: value })}
                                            required
                                            error={errors.taskId}
                                            disabled={!!selectedTask}
                                            />
                                    
                                         
                                        <DateSelect
                                        label="Payment Date"
                                        value={formData.paymentDate}
                                        onChange={(value) => setFormData({ ...formData,paymentDate: value })}
                                        required
                                        error={errors.paymentDate}
                                       
                                        />

                                
                                 
                                         <FormInput
                                        label="Amount"
                                        type='number'
                                        value={formData.amount}
                                        onChange={(value) => setFormData({ ...formData, amount: value })}
                                        placeholder="Enter amount"
                                        icon={<IndianRupee size={16} />}
                                        required
                                        error={errors.amount}
                                        />

                                         <FormInput
                                        label="Paid To "
                                        value={formData.paidTo}
                                        onChange={(value) => setFormData({ ...formData, paidTo: value })}
                                        placeholder="Enter Paid to Details"
                                        error={errors.paidTo}
                                        />
                                        <DropdownSelect
                                            label="Payment Method"
                                            options={[
                                              { value: "Cash", label: "Cash" },
                                              { value: "UPI", label: "UPI" },
                                              { value: "Bank", label: "Bank" },
                                              { value: "Others", label: "Others" }
                                            ]}
                                            value={formData.paymentMethod}
                                            onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                                            required
                                            error={errors.paymentMethod}
                                          />

                                          {/* Show Transaction No only if payment method is GPay or Bank */}
                                          {(formData.paymentMethod === "UPI" || formData.paymentMethod === "Bank") && (
                                            <FormInput
                                              label="Reference"
                                              value={formData.transactionNo}
                                              onChange={(value) => setFormData({ ...formData, transactionNo: value })}
                                              placeholder="Enter reference details"
                                              
                                              
                                            />
                                          )}
                                        <DropdownSelect
                                            label="Category"
                                            // options={[
                                            //     { value: "Travel", label: "Travel" },
                                            //     { value: "Food", label: "Food" },
                                            //     { value: "Office", label: "Office" },
                                            //     { value: "Salary", label: "Salary" },
                                            //     { value: "Materials", label: "Materials" },
                                            //     { value: "Miscellaneous", label: "Miscellaneous" }
                                            // ]}
                                            options={category.map(c => ({ value: c, label: c }))} // ✅ convert to objects
                                            value={formData.category}
                                            onChange={(value) => {setFormData({ ...formData, category: value })
                                             if (value && !category.includes(value)) setCategory([...category, value]);
                                         }
                                          }required
                                            searchable={true}
                                            creatable={true} // allow typing new role
                                            error={errors.category}
                                            />
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editExpense ? 'Update Expense' : 'Add Expense')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddExpense
