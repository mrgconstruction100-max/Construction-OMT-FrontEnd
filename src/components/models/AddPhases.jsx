import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee, Layers, TagsIcon, TagIcon } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddPhases({ isOpen, onClose, onSubmit, editPhase, onEdit,selectedProject }) {
    const [formData,setFormData]=useState({
  
        name:"",
        description:"",
        startDate:null,
        endDate:null,
        status:"",
        projectId:"",
        budget:"",

       
    });
 
  const [projectOptions,setProjectOptions] = useState([]);
  const {projectContext} = useData();
  const statusOptions = [
    { value: 'Planning', label: 'Planning',color: '#f0ab2cff'  },
    { value: 'In Progress', label: 'In Progress',color: '#3daae9ff' },
    { value: 'Completed', label: 'Completed',color: '#1ef102ff' },
    { value: 'On Hold', label: 'On Hold',color: '#f72525ff' },
    { value: 'Waiting for Approval', label: 'Waiting for Approval',color: '#fa6e11ff' },
  ];
   const [errors, setErrors] = useState({});
   const [btnLoading, setBtnLoading] = useState(false);
   

   useEffect(()=>{
      setProjectOptions(projectContext.map(project=>({
          value:project._id,
          label:project.name,
        })))
   },[projectContext]);
   useEffect(() => {
    if (!editPhase && !selectedProject) return;
        let projectFromEdit='';
        if (editPhase) {
          projectFromEdit = editPhase?.projectId?._id || editPhase?.projectId;
          setFormData({...editPhase,
            projectId:projectFromEdit,
            startDate: editPhase.startDate ? new Date(editPhase.startDate) : null,
            endDate: editPhase.endDate ? new Date(editPhase.endDate) : null,});
        }
        else{
          projectFromEdit =selectedProject?._id || ''
          setFormData({
            name:"",
            description:"",
            startDate:null,
            endDate:null,
            status:"",
            projectId:projectFromEdit,
            budget:"",
           
          });
        }
          
        
      }, [editPhase,selectedProject]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Phase name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    // if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
      if (!formData.budget) newErrors.budget = 'Budget is required';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

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
                      startDate: formData.startDate ? formData.startDate.toISOString().split("T")[0] : "",
                      endDate: formData.endDate ? formData.endDate.toISOString().split("T")[0] : "",
                    };
                if (editPhase) {
                  const res=await API.put(`/phase/${editPhase._id}`, payload);
                    onEdit?.(res.data.data);
                    
                } else {
                     const response = await API.post("/phase",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.data);
                      
                       }
                    
       
                setFormData({
                        name:"",
                        description:"",
                        startDate:null,
                        endDate:null,
                        budget:"",
                        status:"",
                        projectId:"",
                        
                       
     
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
              startDate:null,
              endDate:null,
              budget:"",
              status:"",
              projectId:"",
           
          
            });
            setErrors({});
            onClose();
  };
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editPhase ? 'Edit Phase' : 'Add New Phase'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Phase Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter phase name"
                                        required
                                        error={errors.name}
                                        icon={<Layers size={16} />}
                                        />
                                  
                                        <FormInput
                                        label="Description"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter phase description"
                                        multiline
                                        />
                                       

                                        <DropdownSelect
                                        label="Status"
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(value) => setFormData({ ...formData, status: value })}
                                        required
                                        error={errors.status}
                                        />
                                   
                                         <DropdownSelect
                                            label="Project Name"
                                            options={projectOptions}
                                            value={formData.projectId}
                                            onChange={(value) => setFormData({ ...formData, projectId: value })}
                                            searchable
                                            required
                                            error={errors.projectId}
                                            disabled={!!selectedProject}
                                          />

                                        <DateSelect
                                        label="Start Date"
                                        value={formData.startDate}
                                        onChange={(value) => setFormData({ ...formData, startDate: value })}
                                        required
                                        error={errors.startDate}
                                       
                                        />

                                        <DateSelect
                                        label="End Date"
                                        value={formData.endDate}
                                        onChange={(value) => setFormData({ ...formData, endDate: value })}
                                       
                                        min={formData.startDate}
                                        error={errors.endDate}
                                        />
                                 
                                        <FormInput
                                        label="Budget"
                                        type='number'
                                        value={formData.budget}
                                        onChange={(value) => setFormData({ ...formData, budget: value })}
                                        placeholder="Enter amount"
                                        icon={<IndianRupee size={16} />}
                                        required
                                        error={errors.budget}
                                        />
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editPhase ? 'Update Phase' : 'Add Phase')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddPhases
