import { createContext, useContext, useEffect, useState } from 'react'
import API from '../axios'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const {user} = useAuth(); // get logged in user
  const [memberContext, setMemberContext] = useState([]);
  const [clientContext,setClientContext] = useState([]);
  const [projectContext,setProjectContext] = useState([]);
  const [phaseContext,setPhaseContext] = useState([]);
  const [taskContext,setTaskContext] = useState([]);
  const [activityContext,setActivityContext] = useState([]);
  const [userContext,setUserContext] =useState('');
  const [allUserContext,setAllUserContext]= useState([]);
  const [expenseContext,setExpenseContext] = useState([]);
  const [incomeContext,setIncomeContext] = useState([]);
  const [profileContext,setProfileContext] = useState(null);
  useEffect(() => {
    if (user) { // ✅ Only fetch after login
      if(user?.role==="Admin"){
        fetchMemberData();
        fetchClientData();
        fetchAllUserData();
        // fetchActivityData();
      }
      
      fetchProjectData();
      fetchPhaseData();
      fetchTaskData();
      fetchUserData();
      fetchExpenseData();
      fetchIncomeData();
      fetchProfileData();
      

    } else {
      setProjectContext([]); // optional: clear data on logout
      setMemberContext([]);
      setTaskContext([]);
      setPhaseContext([]);
      setUserContext("");
      setAllUserContext([]);
      setExpenseContext([]);
      setClientContext([]);
      setProfileContext("");
      
    }
   
  }, [user]); // ✅ rerun whenever login/logout happens

// Get all member data
  const fetchMemberData = async () => {
    try {
      const res = await API.get('/member')
      const sorted = res.data.sort((a, b) => a.createdAt-b.createdAt)
      setMemberContext(sorted);
     
  
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }

  // get user's member data
  const fetchUserData = async ()=>{
    if(user.role==="Member"){ 
    try {
      const res = await API.get(`/member/${user.memberId}`)
        setUserContext(res.data);
      
    } catch (err) {
      console.error('Failed to load members:', err)
    }
      }
  }

  // get  all clients data
  const fetchClientData = async () => {
    try {
      const res = await API.get('/client')
      const sorted = res.data.sort((a, b) => a.createdAt-b.createdAt)
      setClientContext(sorted);
     
  
    } catch (err) {
      console.error('Failed to load clients:', err)
    }
  }

  // get all user data
  const fetchAllUserData = async()=>{
    try{
      const res = await API.get(`/auth/getUser`);
      setAllUserContext(res.data);
      
    }catch(error){
      console.error('Failed to Load user data:',error);
    }
  }
  //get all project data
  const fetchProjectData = async()=>{
    try{
      const res = await API.get('/project');
      const sorted = res.data.sort((a,b)=> a.createdAt-b.createdAt);
      setProjectContext(sorted);
     
    }catch(error){
      console.error("Failed to load projects in Data Context:",error);
    }
  }

  //get all task data
  const fetchTaskData = async()=>{
    try {
            const res= await API.get("/task");
            const sorted = res.data.data.sort((a,b)=>a.createdAt-b.createdAt);
            setTaskContext(sorted);
           
            }
        catch (error) {
            console.error("Error fetching Tasks in Data Context:", error);
            }

  }

  // get all phase data
  const fetchPhaseData = async()=>{

    try {
           const res=  await API.get("/phase");
           const sorted = res.data.data.sort((a,b)=>a.createdAt-b.createdAt)
           setPhaseContext(sorted);
         
           
            }
        catch (error) {
            console.error("Error fetching Phases in Data Context:", error);
            }
  }

  // get all expense data
  const fetchExpenseData = async()=>{

    try {
           const res=  await API.get("/expense");
           const sorted = res.data.data.sort((a,b)=> new Date(b.paymentDate) - new Date(a.paymentDate))
           setExpenseContext(sorted);
         
           
            }
        catch (error) {
            console.error("Error fetching Expenses in Data Context:", error);
            }
  }

  // get all income data
   const fetchIncomeData = async()=>{

    try {
           const res=  await API.get("/income");
           const sorted = res.data.data.sort((a,b)=> new Date(b.paymentDate) - new Date(a.paymentDate))
           setIncomeContext(sorted);
         
           
            }
        catch (error) {
            console.error("Error fetching Expenses in Data Context:", error);
            }
  }
  
  
//get profile data

const fetchProfileData = async()=>{
  try {
           const res=  await API.get("/profile");
          setProfileContext(res.data|| null);
            }
        catch (error) {
            console.error("Error fetching Profile in Data Context:", error);
            }
}
  return (
    <DataContext.Provider value={{
       memberContext, projectContext,taskContext,phaseContext,activityContext,userContext,allUserContext,expenseContext,clientContext,incomeContext,profileContext,setProfileContext,
       setIncomeContext,setClientContext,setExpenseContext,setMemberContext,setProjectContext,setTaskContext,setPhaseContext,setActivityContext,setUserContext,setAllUserContext}}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
