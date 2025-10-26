import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddIncome({ isOpen, onClose, onSubmit, editIncome, onEdit,selectedProject,selectedPhase,type  }) {
    const [formData,setFormData]=useState({
        name:"",
        description:"",
        paymentDate:null,
        paymentMethod:"",
        projectId:"",
        phaseId:"",
        amount:"",
        transactionNo:""
       
    });
    const [allPhases,setAllPhases] = useState([]);
    const [paymentCategory,setPaymentCategory] = useState()
    const [projectOptions,setProjectOptions] = useState([]);
    const [phaseOptions,setPhaseOptions] = useState([]);
    const {projectContext,phaseContext} = useData();
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);
    const {incomeContext} = useData();

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
   
   useEffect(()=>{
      const uniqueCategory = [...new Set(incomeContext.map(i => i.paymentMethod).filter(Boolean))];
       const defaultCategory = ["Cash", "UPI"] ;
       const combinedCategory =[...new Set([...defaultCategory,...uniqueCategory])];
        setPaymentCategory(combinedCategory);
   },[incomeContext])
   useEffect(() => {
      let projectFromEdit='';
      let phaseFromEdit='';
        if (editIncome) {
           projectFromEdit = editIncome?.projectId?._id || editIncome?.projectId;
           phaseFromEdit = editIncome?.phaseId?._id || editIncome?.phaseId;
           }
          else{
            projectFromEdit=selectedProject?._id || '';
            phaseFromEdit=selectedPhase?._id || '';
           
          }
              // Filter phases for the selected project
            const filteredPhases = allPhases.filter(phase => {
              const pid = typeof phase.projectId === 'object' ? phase.projectId._id : phase.projectId;
              return pid === projectFromEdit;
            });
            setPhaseOptions(filteredPhases);
        if (editIncome) {
          setFormData({
              name:editIncome.name || "",
              description: editIncome.description || "",
              paymentDate: editIncome.paymentDate ? new Date(editIncome.paymentDate) : null,
              paymentMethod: editIncome.paymentMethod || "",
              projectId: projectFromEdit,
              phaseId: phaseFromEdit,
              amount: editIncome.amount || "",
              transactionNo:editIncome.transactionNo || "",
            });
        }
         else {
          setFormData({
            name:"",
            description:"",
            paymentDate:null,
            paymentMethod:"",
            projectId:projectFromEdit,
            phaseId:phaseFromEdit,
            amount:"",
            transactionNo:""
           
          });
        }
      }, [editIncome, allPhases, selectedProject,selectedPhase]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Income title is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
     if (!formData.projectId) newErrors.projectId = 'Project is required';
    // if (!formData.phaseId) newErrors.phaseId = 'Phase is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';


    

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
                     // 🚨 remove empty PhaseId (avoid ObjectId cast error)
                if (!payload.phaseId) {
                  delete payload.phaseId;
                }
                if (type==="edit") {
                  const res=await API.put(`/income/${editIncome._id}`, payload);
                    onEdit?.(res.data.data);
                    
                } else {
                     const response = await API.post("/income",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.data);
                      
                       }
                    
       
                setFormData({
                        name:"",
                        description:"",
                        paymentDate:null,
                        paymentMethod:"",
                        projectId:"",
                        phaseId:"",
                        amount:"",
                        transactionNo:""
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
            projectId:"",
            phaseId:"",
            amount:"",
            transactionNo:""
          
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
                            <h2>{type==="edit" ? 'Edit Income' : 'Add New Income'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                      <FormInput
                                        label="Income title "
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter Income title"
                                        required
                                        error={errors.name}
                                       
                                        />
                                       
                                        <FormInput
                                        label="Description "
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter Income Details"
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
                                          />
                                          <DropdownSelect
                                            label="Phase Name"
                                            options={phaseOptions}
                                            value={formData.phaseId}
                                            onChange={(value) =>setFormData({ ...formData, phaseId: value })}
                                            searchable
                                            
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
                                    {btnLoading? "Uploading" : (type==="edit" ? 'Update Income' : 'Add Income')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddIncome

