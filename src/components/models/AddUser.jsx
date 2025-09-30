import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag, MapPinned, IndianRupee } from 'lucide-react';
import FormInput from '../ui/FormInput';
import DropdownSelect from '../ui/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../ui/DateSelect';
import API from '../../axios';
import { useData } from '../../context/DataContext';


const AddUser = ({isOpen,onClose,onSubmit, editUser, onEdit}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Member",
    memberId:"",
  });
  const [memberOptions , setMemberOptions] = useState([]);
  const {memberContext} = useData();
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
   
    useEffect(()=>{
        fetchMembers();
    },[memberContext])

    const fetchMembers = ()=>{
         try {
          setMemberOptions(
                memberContext.map(member => ({
                    value: member._id,
                    label: member.name,
                    image: getDirectImageUrl(member.photoUrl),
                }))
            )
        }
          catch (error) {
              console.error("Error fetching members:", error);
              }
    }
     useEffect(() => {
        let MemberFromEdit='';
        if (editUser) {
          MemberFromEdit = editUser?.memberId?._id || editUser?.memberId;
          setFormData({...editUser,
            memberId:MemberFromEdit});
        } else {
          setFormData({
            username: "",
            password: "",
            role: "Member",
            memberId:"",
          });
        }
      }, [editUser]);

      const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.memberId) newErrors.memberId = 'Member is required';
    if (!formData.password) newErrors.password = 'Password is required';
    

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
                    };
                if (editUser) {
                  const res=await API.put(`/auth/${editUser._id}`, payload);
                    onEdit?.(res.data.data);
                    
                } else {
                     const response = await API.post("/auth/register",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.user);
                      
                       }
                    
       
                setFormData({
                       username: "",
                        password: "",
                        role: "Member",
                        memberId:"",
                                        
                });
                setErrors({});
                onClose();
                setBtnLoading(false);
            }
        };
        const handleCancel = () => {
            setFormData({
            username: "",
            password: "",
            role: "Member",
            memberId:"",
            });
            setErrors({});
            onClose();
  };
        if (!isOpen) return null;
  return (
  <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>

                                     <DropdownSelect
                                        label="Member Name"
                                        options={memberOptions}
                                        value={formData.memberId}
                                        onChange={(value) => setFormData({ ...formData, memberId: value })}
                                        searchable
                                        required
                                        />

                                        <FormInput
                                        label="Username"
                                        value={formData.username}
                                        onChange={(value) => setFormData({ ...formData, username: value })}
                                        placeholder="Enter Username"
                                        required
                                        error={errors.username}
                                        
                                        />
                                         <FormInput
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(value) => setFormData({ ...formData, password: value })}
                                        placeholder="Enter password"
                                        required
                                        error={errors.password}
                                        
                                        />
                                    

                                        <DropdownSelect
                                        label="User Role"
                                        options={[{value:"Admin",label:"Admin"},{value:"Member",label:"Member"}]}
                                        value={formData.role}
                                        onChange={(value) => setFormData({ ...formData, role: value })}
                                        required
                                        
                                        />
          
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editUser ? 'Update User' : 'Add User')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddUser;
