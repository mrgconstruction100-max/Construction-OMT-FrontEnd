import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';


function AddMember({ isOpen, onClose, editMember, onEdit,onSubmit }) {
    const [formData,setFormData]=useState({
        name:"",
      phone:"",
      dateOfBirth:null,
      maritalStatus:"",
      personalEmail:"",
      address:"",
      role:"",
      //  image: null, // ✅ new
    //   skills:[],
       
    });
    const {memberContext} = useData();
    const [roles, setRoles] = useState([]);
    const [members, setMembers] = useState([]); // Dynamic role list
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);
   useEffect(() =>  {
           
        if (editMember) {
          setFormData({...editMember,
            dateOfBirth:editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
          //  image: null, // when editing, leave image empty unless uploading new one
          });
        } else {
          setFormData({
           name:"",
            phone:"",
            dateOfBirth:null,
            maritalStatus:"",
            personalEmail:"",
            address:"",
            role:"",
            // skills:[],
            // image: null, 
          });
        }
      }, [editMember]);


    useEffect(() => {
       const uniqueRoles = [...new Set(memberContext.map(m => m.role).filter(Boolean))];
       const defaultRoles = ["Project Manager", "Engineer", "Site Engineer"] ;
       const combinedRoles =[...new Set([...defaultRoles,...uniqueRoles])];
        setRoles(combinedRoles);
    }, [memberContext]);

  

 const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = ' name is required';
    // if (!formData.dateOfBirth ) newErrors.dateOfBirth = 'Birth date is required';
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
                     dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : "",
                   
                };
            
               try {
                if(editMember){
                    const res = await API.patch(`/member/${editMember._id}`, payload); // PATCH only these fields
                    onEdit(res.data); // callback to parent
                }
                else{
                     const response = await API.post("/member/add",payload);
                      // Call parent to add to local state instantly
                      onSubmit(response.data.member);
                }    
                 setFormData({
                      name:"",
                        phone:"",
                        dateOfBirth:null,
                        maritalStatus:"",
                        personalEmail:"",
                        address:"",
                        role:"",
                        // skills:[],
                        // image: null, 
                      });
                      setErrors({});
                      onClose();
                      setBtnLoading(false);
                    } 
                catch (err) {
                    alert("Failed to update member.");
                    console.log(err);
                    }  
            } 
        };
        const handleCancel = () => {
            setFormData({
                    name:"",
                    phone:"",
                    dateOfBirth:null,
                    maritalStatus:"",
                    personalEmail:"",
                    address:"",
                    role:"",
                    // skills:[],
                    // image: null,
          
            });
            setErrors({});
            onClose();
  };

        if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editMember ? 'Edit Member' : 'Add New Member'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter Member name"
                                        required
                                        error={errors.name}
                                        
                                        />
                               
                                           
                                        <FormInput
                                        type='number'
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={(value) => setFormData({ ...formData, phone: value })}
                                        placeholder="Enter Mobile Number"
                                        required
                                         error={errors.phone}
                                        />

              

                                    
                                            <DropdownSelect
                                        label="Role"
                                          options={roles.map(r => ({ value: r, label: r }))} // ✅ convert to objects
                                        value={formData.role}
                                        onChange={(value) =>{ setFormData({ ...formData, role: value })
                                        if (value && !roles.includes(value)) setRoles([...roles, value]);
                                         } }
                                        searchable={true}
                                        creatable={true} // allow typing new role
                                        
                                        />
                                        <FormInput
                                        label="Personal Email"
                                        value={formData.personalEmail}
                                        onChange={(value) => setFormData({ ...formData, personalEmail: value })}
                                        placeholder="Enter Personal Email"
                                        />
                                  

                                        <FormInput
                                        label="Address"
                                        value={formData.address}
                                        onChange={(value) => setFormData({ ...formData, address: value })}  
                                        placeholder="Enter Address details"
                                        multiline
                                        />
                                    
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading":(editMember ? 'Update Member' : 'Add Member')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddMember
