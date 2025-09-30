import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "../../context/DataContext";
import API from "../../axios";
import FormInput from "../../components/ui/FormInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
export default function ProfileSettings() {
  const [name,setName] = useState("");
  const [file,setFile] = useState(null);
  const [preview, setPreview] = useState(null);
   const [error, setError]=useState("");
  const {profileContext,setProfileContext} = useData();
  const [loading, setLoading]=useState(false);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "", message: "" });

  useEffect(() => {
    setName(profileContext?.name ||"");
    setPreview(profileContext?.image|| null)
  }, [profileContext]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // show preview immediately
    }
  };
  const handleSubmit=async(e)=>{
      e.preventDefault();
      if(loading){
        return
      }
      setLoading(true);
      setError("");

      

      if(!name){
        setLoading(false);
        return setError("name field is required");
      }

      const formData = new FormData();
      formData.append('name',name);
      if(file){
      formData.append('file',file);
      }

      try{
       const res = await API.post('/profile',formData, {
           headers: { "Content-Type": "multipart/form-data" },});
       setProfileContext(res.data);
        setName("");
        setFile(null);
         setInfoDialog({
                  open: true,
                  type: "success",
                  message: "Profile created successfully.",
                });      
                
      }catch(err){
        setError(err.response?.data?.message||'Upload failed')
        setInfoDialog({
                open: true,
                type: "error",
                message: "Failed to create profile.",
              });
              

      }finally{
        setLoading(false);
      }
    };
  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Business Name"
              value={name}
              onChange={(value)=>setName(value)}
              placeholder="Enter Business Name"
            />
            <Input
              label="Logo"
              type="file"  
              onChange={handleImageChange}
              
            />
            {preview && (
          <img
            src={preview}
            alt="Profile Preview"
            className="mt-2 w-20 h-20 rounded-full object-cover border"
          />
        )}
            <Button type="submit" disabled={loading} className="w-full">
              Update Profile
            </Button>
          </form>
          {error && <p className="text-center mt-3">{error}</p>}
        </CardContent>
      </Card>
      {/* Info Dialog (Success / Error) */}
                  <Dialog open={infoDialog.open} onOpenChange={(open) => setInfoDialog({ ...infoDialog, open })}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{infoDialog.type === "error" ? "Error" : "Success"}</DialogTitle>
                        <DialogDescription>{infoDialog.message}</DialogDescription>
                      </DialogHeader>
                      <Button onClick={() => setInfoDialog({ ...infoDialog, open: false })}>OK</Button>
                    </DialogContent>
                  </Dialog>
    </div>
  );
}
