import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddExpense({ isOpen, onClose, onSubmit, editExpense, onEdit,selectedProject,selectedPhase,type }) {
    const [formData,setFormData]=useState({
        name:"",
        description:"",
        paymentDate:null,
        paymentMethod:"",
        paidTo:"",
        projectId:"",
        phaseId:"",
        amount:"",
        category:"",
        transactionNo:"",
        workers:'',
        salary:'',
        food:'',
        quantity:'',
        price:'',
        miscellaneous:'',
        unit:'',

       
    });
    const [allPhases,setAllPhases] = useState([]);
    const [projectOptions,setProjectOptions] = useState([]);
    const [phaseOptions,setPhaseOptions] = useState([]);
    const {projectContext,phaseContext,expenseContext} = useData();
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [paymentCategory,setPaymentCategory] = useState([]);

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
      
    
   },[projectContext,phaseContext]);

   useEffect(() => {
       const uniqueCategory = [...new Set(expenseContext.map(e => e.category).filter(Boolean))];
       const defaultCategory = ["Travel", "Labour","Materials","Miscellaneous"] ;
       const combinedCategory =[...new Set([...defaultCategory,...uniqueCategory])];
       const uniqueMethod =  [...new Set(expenseContext.map(e => e.paymentMethod).filter(Boolean))];
       const defaultMethod = ["Cash", "UPI"] ;
       const combinedMethod = [...new Set([...defaultMethod,...uniqueMethod])];
        setCategory(combinedCategory);
        setPaymentCategory(combinedMethod);
    }, [expenseContext]);

    useEffect(() => {
              let total = 0;

              // Convert possible empty strings to 0
              const salary = parseFloat(formData.salary) || 0;
              const food = parseFloat(formData.food) || 0;
              const misc = parseFloat(formData.miscellaneous) || 0;
              const qty = parseFloat(formData.quantity) || 0;
              const price = parseFloat(formData.price) || 0;

              if (formData.category === "Labour") {
                total = salary + food + misc;
              } else if (formData.category === "Materials") {
                const roundedTotal = qty * price ;
                total = parseFloat(roundedTotal.toFixed(2)) +misc;
              } else {
                // For other categories, don't auto-calculate — user will type manually
                return;
              }

              // Update total amount in formData
              setFormData(prev => ({ ...prev, amount: total }));
            }, [formData.category,formData.salary,formData.food,formData.miscellaneous,formData.quantity,formData.price,]);
            
            useEffect(() => {
                    // Reset category-specific fields when category changes
                    if (formData.category === "Labour") {
                      // Clear Materials fields
                      setFormData(prev => ({
                        ...prev,
                        quantity: '',
                        price: '',
                        unit: '',
                      }));
                    } else if (formData.category === "Materials") {
                      // Clear Labour fields
                      setFormData(prev => ({
                        ...prev,
                        workers: '',
                        salary: '',
                        food: '',
                      }));
                    } else {
                      // For other categories (Travel, Miscellaneous, etc.), clear all category-specific fields
                      setFormData(prev => ({
                        ...prev,
                        workers: '',
                        salary: '',
                        food: '',
                        quantity: '',
                        price: '',
                        unit: '',
                        miscellaneous: '',
                      }));
                    }
                  }, [formData.category]); // Only trigger when category changes

   useEffect(() => {
    if (!editExpense && !selectedProject) return;
      let projectFromEdit='';
      let phaseFromEdit='';
    
        if (editExpense) {
           projectFromEdit = editExpense?.projectId?._id || editExpense?.projectId;
           phaseFromEdit = editExpense?.phaseId?._id || editExpense?.phaseId;
           
          }
          else{
            projectFromEdit=selectedProject?._id || '';
            phaseFromEdit=selectedPhase?._id || '';
           
          }  // Filter phases for the selected project
            const filteredPhases = allPhases.filter(phase => {
              const pid = typeof phase.projectId === 'object' ? phase.projectId._id : phase.projectId;
              return pid === projectFromEdit;
            });
            setPhaseOptions(filteredPhases);
           
             if (editExpense) {      
            setFormData({
              name:editExpense.name || "",
              description: editExpense.description || "",
              paymentDate: editExpense.paymentDate ? new Date(editExpense.paymentDate) : null,
              paymentMethod: editExpense.paymentMethod || "",
              paidTo: editExpense.paidTo || "",
              projectId: projectFromEdit,
              phaseId: phaseFromEdit,
              amount: editExpense.amount || "",
              category: editExpense.category || "",
              transactionNo:editExpense.transactionNo ||"",
              workers:editExpense.workers || "",
              salary:editExpense.salary || "",
              food:editExpense.food || "",
              quantity:editExpense.quantity || "",
              price:editExpense.price || "",
              miscellaneous:editExpense.miscellaneous || "",
              unit:editExpense.unit || "",
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
            amount:"",
            category:"",
            transactionNo:"",
            workers:'',
            salary:'',
            food:'',
            quantity:'',
            price:'',
            miscellaneous:'',
            unit:'',
           
          });
        }
      }, [editExpense, selectedProject,selectedPhase, allPhases]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Expense detail is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
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
                if (type==="edit") {
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
                        amount:"",
                        category:"",
                        transactionNo:"",
                        workers:'',
                        salary:'',
                        food:'',
                        quantity:'',
                        price:'',
                        miscellaneous:'',
                        unit:'',
     
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
              amount:"",
              category:"",
              transactionNo:"",
              workers:'',
              salary:'',
              food:'',
              quantity:'',
              price:'',
              miscellaneous:'',
              unit:'',
          
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
 
    setFormData(prev => ({
      ...prev,
      projectId,
      phaseId:'',

    }));
  };
 
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{type==='edit' ? 'Edit Expense' : 'Add New Expense'}</h2>
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
                                            label="Category"
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

                                         {/* Show  only if Category is Labour */}
                                          {(formData.category === "Labour") && (<>
                                          
                                            <FormInput
                                              label="Workers"
                                              type='number'
                                              value={formData.workers}
                                              onChange={(value) => setFormData({ ...formData, workers: value })}
                                              placeholder="Enter No of workers" 
                                            />
                                            <FormInput
                                              label="Salary"
                                              type='number'
                                              value={formData.salary}
                                              onChange={(value) => setFormData({ ...formData, salary: value })}
                                              placeholder="Enter salary amount" 
                                            />
                                            <FormInput
                                              label="Food Amount"
                                              type='number'
                                              value={formData.food}
                                              onChange={(value) => setFormData({ ...formData,food: value })}
                                              placeholder="Enter food amount" 
                                            />
                                            <FormInput
                                              label="Miscellaneous"
                                              type='number'
                                              value={formData.miscellaneous}
                                              onChange={(value) => setFormData({ ...formData, miscellaneous: value })}
                                              placeholder="Enter miscellaneous amounts" 
                                            />
                                            </>
                                          )}

                                           {/* Show  only if Category is Labour */}
                                          {(formData.category === "Materials") && (<>
                                          
                                            <FormInput
                                              label="Unit"
                                              value={formData.unit}
                                              onChange={(value) => setFormData({ ...formData, unit: value })}
                                              placeholder="Enter unit type" 
                                            />
                                            <FormInput
                                              label="Quantity"
                                              type='number'
                                              value={formData.quantity}
                                              onChange={(value) => setFormData({ ...formData, quantity: value })}
                                              placeholder="Enter quantity" 
                                            />
                                            <FormInput
                                              label="Unit Price"
                                              type='number'
                                              value={formData.price}
                                              onChange={(value) => setFormData({ ...formData,price: value })}
                                              placeholder="Enter unit price" 
                                            />
                                            <FormInput
                                              label="Miscellaneous"
                                              type='number'
                                              value={formData.miscellaneous}
                                              onChange={(value) => setFormData({ ...formData, miscellaneous: value })}
                                              placeholder="Enter miscellaneous amounts" 
                                            />
                                            </>
                                          )}
                                             <FormInput
                                        label="Total Amount"
                                        type='number'
                                        value={formData.amount}
                                        onChange={(value) => setFormData({ ...formData, amount: value })}
                                        placeholder="Enter amount"
                                        icon={<IndianRupee size={16} />}
                                        required
                                        error={errors.amount}
                                        disabled={formData.category === "Labour" || formData.category === "Materials"}
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
                                            onChange={(value) => setFormData({ ...formData, phaseId: value })}
                                            searchable
                                            required
                                            error={errors.phaseId}
                                            disabled={!!selectedPhase}
                                          />
                                 
                                         
                                        <DateSelect
                                        label="Payment Date"
                                        value={formData.paymentDate}
                                        onChange={(value) => setFormData({ ...formData,paymentDate: value })}
                                        required
                                        error={errors.paymentDate}
                                       
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
                                            options={paymentCategory.map(p => ({ value: p, label: p }))} // ✅ convert to objects
                                            value={formData.paymentMethod}
                                           onChange={(value) =>{ setFormData({ ...formData,paymentMethod: value })
                                              if (value && !paymentCategory.includes(value)) setPaymentCategory([...paymentCategory, value]);
                                              } }
                                              searchable={true}
                                              creatable={true} // allow typing new role
                                              required
                                               error={errors.paymentMethod}
                                          />

                                            <FormInput
                                              label="Reference"
                                              value={formData.transactionNo}
                                              onChange={(value) => setFormData({ ...formData, transactionNo: value })}
                                              placeholder="Enter reference details"
           
                                            />
                                  
                                      
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (type==='edit' ? 'Update Expense' : 'Add Expense')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddExpense
