import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee, TagIcon, Tags } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';



function AddProject({ isOpen, onClose, onSubmit, editProject, onEdit }) {
    const [formData,setFormData]=useState({
        name:"",
        description:"",
        location:"",
        startDate:null,
        endDate:null,
        typeId:"",
        status:"",
        clientId:"",
        projectManager:""
       
    });
    const {memberContext,clientContext} = useData();
     const[memberOptions,setMemberOptions]  = useState([]);
     const [clientOptions,setClientOptions] = useState([]);
  const statusOptions = [
    { value: 'Planning', label: 'Planning',color: '#e0b25dff'  },
    { value: 'In Progress', label: 'In Progress',color: '#3daae9ff' },
    { value: 'Completed', label: 'Completed',color: '#1ef102ff' },
    { value: 'On Hold', label: 'On Hold',color: '#f72525ff' },
    { value: 'Delayed', label: 'Delayed',color: '#fa7000ff' },
    { value: 'Cancelled', label: 'Cancelled',color: '#f72525ff' },
  ];
   const [errors, setErrors] = useState({});
   const [btnLoading, setBtnLoading] = useState(false);
   useEffect(()=>{
      setMemberOptions(memberContext.map(member => ({
        value: member?._id,
        label: member?.name,
        //image: getDirectImageUrl(member.photoUrl),
      })))
      setClientOptions(clientContext.map(client => ({
        value: client?._id,
        label: client?.name,
        //image: getDirectImageUrl(member.photoUrl),
      })))
   },[memberContext,clientContext])
   useEffect(() => {
        let clientIdFromEdit="";
        let projectManagerFromEdit="";
        if (editProject) {
          clientIdFromEdit = editProject?.clientId?._id || editProject?.clientId;
          projectManagerFromEdit = editProject?.projectManager?._id || editProject?.projectManager;
          setFormData({...editProject,
            projectManager:projectManagerFromEdit,
            clientId:clientIdFromEdit,
            startDate: editProject.startDate ? new Date(editProject.startDate) : null,
            endDate: editProject.endDate ? new Date(editProject.endDate) : null,});
        } else {
          setFormData({
            name:"",
            description:"",
            location:"",
            startDate:null,
            endDate:null,
            typeId:"",
            status:"",
            clientId:"",
            projectManager:""
           
          });
        }
      }, [editProject]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    // if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.projectManager) newErrors.projectManager = 'Project Manager is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.clientId) newErrors.clientId = 'Client is required';
     

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
                if (editProject) {
                  const res=await API.put(`/project/${editProject._id}`, payload);
                    onEdit?.(res.data.project);
                    
                } else {
                     const response = await API.post("/project",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.project);
                      
                       }
                    
       
                setFormData({
                        name:"",
                        description:"",
                        location:"",
                        startDate:null,
                        endDate:null,
                        typeId:"",
                        status:"",
                        clientId:"",
                        projectManager:""
                       
     
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
            location:"",
            startDate:null,
            endDate:null,
            typeId:"",
            status:"",
            clientId:"",
            projectManager:""
          
            });
            setErrors({});
            onClose();
  };
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editProject ? 'Edit Project' : 'Add New Project'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Project Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter project name"
                                        required
                                        error={errors.name}
                                        icon={<FolderOpen size={16} />}
                                        />
                                        <FormInput
                                        label="Project Id"
                                        value={formData.typeId}
                                        onChange={(value) => setFormData({ ...formData, typeId: value })}
                                        placeholder="Enter project id"
                                        icon={<TagIcon size={16} />}
                                        />
                                       

                                        <FormInput
                                        label="Description"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter project description"
                                        
                                        multiline
                                        />

                                        <FormInput
                                        label="Location"
                                        value={formData.location}
                                        onChange={(value) => setFormData({ ...formData, location: value })}
                                        placeholder="Enter project location"
                                        icon={<MapPinned size={16} />}
                                        
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
                                            label="Project Manager"
                                            options={memberOptions}
                                            value={formData.projectManager}
                                            onChange={(value) => setFormData({ ...formData, projectManager: value })}
                                            searchable
                                            required
                                            error={errors.projectManager}
                                          />
                                         <DropdownSelect
                                            label="Client"
                                            options={clientOptions}
                                            value={formData.clientId}
                                            onChange={(value) => setFormData({ ...formData, clientId: value })}
                                            searchable
                                            required
                                            error={errors.clientId}
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
                                 
                                        
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editProject ? 'Update Project' : 'Add Project')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddProject
