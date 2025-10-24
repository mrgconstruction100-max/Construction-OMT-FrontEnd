import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee, TagIcon } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddTasks({ isOpen, onClose, onSubmit, editTask, onEdit,selectedProject,selectedPhase }) {
    const [formData,setFormData]=useState({
        typeId:"",
        name:"",
        description:"",
        startDate:null,
        endDate:null,
        budget:"",
        status:"",
        projectId:"",
        phaseId:"",
        assignedTo:[],


       
    });
    const [allPhases,setAllPhases] = useState([]);
    const [projectOptions,setProjectOptions] = useState([]);
    const [phaseOptions,setPhaseOptions] = useState([]);
    const[memberOptions,setMemberOptions]  = useState([]);
    const {projectContext,phaseContext,memberContext} = useData();
    const statusOptions = [
      { value: 'Planning', label: 'Planning',color: '#f0ab2cff'  },
      { value: 'In Progress', label: 'In Progress',color: '#3daae9ff' },
      { value: 'Completed', label: 'Completed',color: '#1ef102ff' },
      { value: 'On Hold', label: 'On Hold',color: '#f72525ff' },
      { value: 'Cancelled', label: 'Cancelled',color: '#330f0f96' },
    ];
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);

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

        setMemberOptions(
      memberContext.map(member => ({
        value: member._id,
        label: member.name,
        image: getDirectImageUrl(member.photoUrl),
      }))
    );
   },[projectContext,phaseContext,memberContext]);
   
   useEffect(() => {
     if (!editTask && !selectedProject && allPhases.length === 0) return;
      let projectFromEdit='';
      let phaseFromEdit='';
        if (editTask) {
           projectFromEdit = editTask?.projectId?._id || editTask?.projectId;
           phaseFromEdit = editTask?.phaseId?._id || editTask?.phaseId;
        }
        else{
            projectFromEdit=selectedProject?._id || selectedProject || '';
            phaseFromEdit=selectedPhase?._id || selectedPhase || '';
        }  
           // Filter phases for the selected project
            const filteredPhases = allPhases.filter(phase => {
              const pid = typeof phase.projectId === 'object' ? phase.projectId._id : phase.projectId;
              return pid === projectFromEdit;
            });
            setPhaseOptions(filteredPhases);
        if (editTask) {
          setFormData({...editTask,
            projectId:projectFromEdit,
            phaseId:phaseFromEdit,
            assignedTo: Array.isArray(editTask.assignedTo)
            ? editTask.assignedTo.map(m => m._id) // ✅ multiple members pre-selected
            : [],
            startDate: editTask.startDate ? new Date(editTask.startDate) : null,
            endDate: editTask.endDate ? new Date(editTask.endDate) : null,});
        } else {
          setFormData({
            typeId:"",
            name:"",
            description:"",
            startDate:null,
            endDate:null,
            budget:"",
            status:"",
            projectId: selectedProject? selectedProject._id : '',
            phaseId:selectedPhase? selectedPhase._id : '',
            assignedTo:[],
            
           
          });
        }
      }, [editTask,selectedProject,selectedPhase, allPhases]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Task name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    // if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.phaseId) newErrors.phaseId = 'Phase is required';
    if (!formData.assignedTo || formData.assignedTo.length === 0) newErrors.assignedTo = 'Assigned To  is required';
    //  if (!formData.budget) newErrors.budget = 'Budget is required';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
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
                if (editTask) {
                  const res=await API.put(`/task/${editTask._id}`, payload);
                    onEdit?.(res.data.data);
                    
                } else {
                     const response = await API.post("/task",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.data);
                      
                       }
                    
       
                setFormData({
                        typeId:"",
                        name:"",
                        description:"",
                        startDate:null,
                        endDate:null,
                        budget:"",
                        status:"",
                        projectId:"",
                        phaseId:"",
                        assignedTo:[],
                        
                       
     
                });
                setErrors({});
                onClose();
                setBtnLoading(false);
            }
        };
        const handleCancel = () => {
            setFormData({
              typeId:"",
              name:"",
              description:"",
              startDate:null,
              endDate:null,
              budget:"",
              status:"",
              projectId:"",
              phaseId:"",
              assignedTo:[],
           
          
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
      phaseId: filtered.some(p => p.value === prev.phaseId) ? prev.phaseId : '',
    }));
  };
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editTask ? 'Edit Task' : 'Add New Task'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Task Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter task name"
                                        required
                                        error={errors.name}
                                        icon={<CheckSquare size={16} />}
                                        />
                                        <FormInput
                                        label="Task Id"
                                        value={formData.typeId}
                                        onChange={(value) => setFormData({ ...formData, typeId: value })}
                                        placeholder="Enter task name"
                                        icon={<TagIcon size={16} />}
                                        />
                                       

                                        <FormInput
                                        label="Description"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter task description"
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
                                          <DropdownSelect
                                            label="Assigned To"
                                            options={memberOptions}
                                            value={formData.assignedTo}
                                            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                                            searchable
                                            multiple
                                            required
                                            error={errors.assignedTo}
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
                                        // required
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
                                        
                                        />
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editTask ? 'Update Task' : 'Add Task')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddTasks
