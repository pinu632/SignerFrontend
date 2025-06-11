import React, { useReducer, useState } from 'react';
import { Upload, X, Plus, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import baseUrl from '../../config'
import { authContext } from '../context/authContext';
import { LoaderCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearDocument, setDocument } from '../redux/slices/DocumentSlice';

const DocumentUpload = () => {
  const [documentName, setDocumentName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [signers, setSigners] = useState([{ email: '', name: '' }]);
  const [copyTo, setCopyTo] = useState([{ email: '', name: '' }]);
  const [isLoading,setIsLoading] = useState(false)

  const navigate = useNavigate()

  const {user} = authContext()
 const dispatch = useDispatch()



  
  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (!documentName) {
      setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const addSigner = () => {
    setSigners([...signers, { email: '', name: '' }]);
  };

  const removeSigner = (index) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const updateSigner = (index, field, value) => {
    const updated = signers.map((signer, i) => 
      i === index ? { ...signer, [field]: value } : signer
    );
    setSigners(updated);
  };

  const addCopyRecipient = () => {
    setCopyTo([...copyTo, { email: '', name: '' }]);
  };

  const removeCopyRecipient = (index) => {
    setCopyTo(copyTo.filter((_, i) => i !== index));
  };

  const updateCopyRecipient = (index, field, value) => {
    const updated = copyTo.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setCopyTo(updated);
  };


  const handleUpload = async ()=>{

    setIsLoading(true)

    const formData = new FormData()
    formData.append('documentName',documentName)
    formData.append('signers',JSON.stringify(signers))
    formData.append('file',uploadedFile) 


    const res = await axios.post(`${baseUrl}/file/upload`,formData,{
       headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
    })



    if(res.status === 201){
       setIsLoading(false)
       dispatch(setDocument(res.data.data))
       navigate(`/uploaded/${res.data.data._id}/${user.email}`)
       
       dispatch(clearDocument())

       setDocumentName('')
       
    }else if(res.status === 400){
      alert(res.data.message + "please log in first")
    }

    console.log(res.data.data)
  }

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-rose-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-rose-50 rounded-lg">
            <ChevronLeft 
             onClick={()=>{
                navigate(-1)
             }}
            className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-rose-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Document Upload</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {uploadedFile ? (
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-rose-600 hover:text-rose-700 mt-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="mb-4">Drop your file here or click to browse</p>
                <input
                  type="file"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Document Name */}
        <div className="bg-white rounded-lg border border-rose-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Document Name</h2>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Assign Signers */}
        <div className="bg-white rounded-lg border border-rose-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Assign Signers</h2>
            <button
              onClick={addSigner}
              className="flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {signers?.map((signer, index) => (
              <div key={index} className="flex space-x-4">
                <input
                  type="text"
                  value={signer.name}
                  onChange={(e) => updateSigner(index, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
                <input
                  type="email"
                  value={signer.email}
                  onChange={(e) => updateSigner(index, 'email', e.target.value)}
                  placeholder="Email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
                {signers.length > 1 && (
                  <button
                    onClick={() => removeSigner(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Send Copy To */}
        <div className="bg-white rounded-lg border border-rose-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Send Copy To</h2>
            <button
              onClick={addCopyRecipient}
              className="flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {copyTo.map((recipient, index) => (
              <div key={index} className="flex space-x-4">
                <input
                  type="text"
                  value={recipient.name}
                  onChange={(e) => updateCopyRecipient(index, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
                <input
                  type="email"
                  value={recipient.email}
                  onChange={(e) => updateCopyRecipient(index, 'email', e.target.value)}
                  placeholder="Email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => removeCopyRecipient(index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleUpload}
          className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg">
            {isLoading?<LoaderCircle />:"Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;