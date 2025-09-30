import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee } from 'lucide-react';
import FormInput from '../ui/FormInput';
import styles from './AddModel.module.scss';
import API from '../../axios';




function AddClients({ isOpen, onClose, onSubmit, editClient, onEdit }) {
    const [formData,setFormData]=useState({
        name:"",
        description:"",
        email:"",
        phone:"",
        address:"",

       
    });

  
   const [errors, setErrors] = useState({});
   const [btnLoading, setBtnLoading] = useState(false);
   
   useEffect(() => {
        if (editClient) {
          setFormData({...editClient,
           });
        } else {
          setFormData({
             name:"",
            description:"",
            email:"",
            phone:"",
            address:"",
            
          });
        }
      }, [editClient]);

    const validateForm = () => {
    const newErrors = {};
   if (!formData.name.trim()) newErrors.name = ' name is required';
    if (!formData.phone) newErrors.phone = 'Mobile Number is required';
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
                    };
                if (editClient) {
                  const res=await API.put(`/client/${editClient._id}`, payload);
                    onEdit?.(res.data.client);
                    
                } else {
                     const response = await API.post("/client",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.client);
                      
                       }
                    
       
                setFormData({
                         name:"",
                        description:"",
                        email:"",
                        phone:"",
                        address:"",
                        
                       
     
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
            email:"",
            phone:"",
            address:"",

          
            });
            setErrors({});
            onClose();
  };
        if (!isOpen) return null;

  return (
                   <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editClient ? 'Edit Client' : 'Add New Client'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Client Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter Client name"
                                        required
                                        error={errors.name}
                                        icon={<FolderOpen size={16} />}
                                        />
                                       

                                        <FormInput
                                        label="Description"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter Client description"
                                        multiline
                                        />

                                          <FormInput
                                        label="Email Id"
                                        type='email'
                                        value={formData.email}
                                        onChange={(value) => setFormData({ ...formData, email: value })}
                                        placeholder="Enter Client email"
                                        
                                        />

                                          <FormInput
                                        label="Phone Number"
                                        type="number"
                                        value={formData.phone}
                                        onChange={(value) => setFormData({ ...formData,phone: value })}
                                        placeholder="Enter Client Phone Number"
                                        required
                                        error={errors.phone}
                                        />

                                          <FormInput
                                        label="Address"
                                        value={formData.address}
                                        onChange={(value) => setFormData({ ...formData, address: value })}
                                        placeholder="Enter Client address"
                                        multiline
                                        />
                                       

                                       
                                
                                       
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editClient ? 'Update Client' : 'Add Client')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddClients
