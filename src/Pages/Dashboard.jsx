import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearDocument } from '../redux/slices/DocumentSlice';
import {
  FileText,
  Upload,
  Users,
  UserPlus,
  Contact,
  User,
  LogIn,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
   Edit2, Download 
} from 'lucide-react';

import GoogleSignInOverlay from '../Components/googleAuth/GoogleAuthOverlay';
import { authContext } from '../context/authContext';
import { useEffect } from 'react';
import { fetchAssignedDocuments, getAllDocuments, getDocumentsWithFields } from '../services/DocumentServices';
import { persistor } from '../redux/store';
import { getDocumentWithFields } from '../../../backend/controller/Document.controller';
import { useDispatch } from 'react-redux';
import { addField, setDocument } from '../redux/slices/DocumentSlice';
import axios from 'axios';
import baseUrl from '../../config';

const Dashboard = () => {

  const { user, isAuthenticated, logout } = authContext();

  const [activeSection, setActiveSection] = useState('create');
  const [isSignedIn, setIsSignedIn] = useState(!!user); // Toggle this to test signed in/out states
  const [userName] = useState('John Doe');
  const [showSignUp, setShowSignUp] = useState(false)

  // if(!user){
  //   setShowSignUp(true)
  // }

  const dispatch = useDispatch()

  const navigate = useNavigate()


  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDocuments() {
      console.log("fetch document")
      try {
        const docs = await getAllDocuments();
        setDocuments(docs.documents);
        console.log(docs.documents)
      } catch (err) {
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!user) {
      setShowSignUp(true)
    }
  }, [])

const handleEditDocument = async (docId) => {
  try {
    // Clear current Redux state for document and fields
    dispatch(clearDocument());
    

    // Fetch new document and fields
    const data = await getDocumentsWithFields(docId);


    console.log(data.fields)
    // Update state
    dispatch(setDocument(data.document));
   
    dispatch(addField(data.fields));

    // Navigate
    navigate(`/edit/${data.document._id}/${user.email}`);
  } catch (err) {
    console.error("Error while editing document:", err);
  }
};
const handleSignDocument = async (document) => {

  console.log(document.fields)
  try {
    // Clear current Redux state for document and fields
    dispatch(clearDocument());
    

    // Fetch new document and fields
    // const data = await getDocumentsWithFields(docId);


    // console.log(data.fields)
    // Update state
    dispatch(setDocument(document.document));
   
    dispatch(addField(document.fields));

    // Navigate
    navigate(`/sign/${document.document._id}/${user.email}`);
  } catch (err) {
    console.error("Error while editing document:", err);
  }
};

const handleLogout = async () =>{
   try {

    const res = await axios.post(`${baseUrl}/auth/logout`)

    if(res.status === 200){
      persistor.purge()

    }

     
    
   } catch (error) {
    console.error(error)
   }
}

  

  // Mock data
  // const documents = [
  //   {
  //     id: 1,
  //     name: 'Contract Agreement.pdf',
  //     status: 'completed',
  //     date: '2024-06-08',
  //     signers: 3
  //   },
  //   {
  //     id: 2,
  //     name: 'NDA Document.pdf',
  //     status: 'pending',
  //     date: '2024-06-07',
  //     signers: 2
  //   },
  //   {
  //     id: 3,
  //     name: 'Service Agreement.pdf',
  //     status: 'in-progress',
  //     date: '2024-06-06',
  //     signers: 4
  //   }
  // ];

  // const assignedDocs = [
  //   {
  //     id: 1,
  //     name: 'Employment Contract.pdf',
  //     from: 'Sarah Wilson',
  //     dueDate: '2024-06-12',
  //     status: 'pending'
  //   },
  //   {
  //     id: 2,
  //     name: 'Project Proposal.pdf',
  //     from: 'Mike Johnson',
  //     dueDate: '2024-06-10',
  //     status: 'urgent'
  //   }
  // ];

  const [assignedDocs,setAssignedDocs] = useState([])

  useEffect(()=>{

    const fetchAssignedDocs = async () =>{
      const data = await fetchAssignedDocuments()
     setAssignedDocs(data.data)
     console.log(data.data)
    }

    fetchAssignedDocs()

  },[])

  const sidebarItems = [
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'assigned', label: 'Assigned for Me', icon: UserPlus, count: assignedDocs.length },
    { id: 'contact', label: 'Contact', icon: Contact }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'urgent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'urgent': return AlertCircle;
      default: return Clock;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'create':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Document</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className="bg-white rounded-lg border border-rose-200 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-rose-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document</h3>
                  <p className="text-gray-600 mb-4">Drag and drop your file or click to browse</p>
                  <button
                    onClick={() => [
                      navigate('/upload')
                    ]}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg transition-colors">
                    Choose File
                  </button>
                </div>
              </div>

              {/* Assign Section */}
              <div className="bg-white rounded-lg border border-rose-200 p-6">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-rose-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assign to Signers</h3>
                  <p className="text-gray-600 mb-4">Add people who need to sign this document</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                    />
                    <button className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg transition-colors">
                      Add Signer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>

            <div className="bg-white rounded-lg border border-rose-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => {
                  const StatusIcon = getStatusIcon(doc.status);
                  return (
                    <div key={doc.id} className="p-4 hover:bg-rose-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-rose-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                            {doc.signers.map((e) => (
                              <p key={e.email} className="text-[10px] text-gray-600">{e.email}</p>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {doc.status}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{doc.date}</p>
                          </div>

                          {/* Buttons */}
                          <button
                            onClick={() => handleEditDocument(doc._id)}
                            className="p-1 rounded hover:bg-rose-100 text-rose-600"
                            aria-label="Edit Document"
                          >
                            <Edit2 
                            
                            className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleDownload(doc.id)}
                            className="p-1 rounded hover:bg-rose-100 text-rose-600"
                            aria-label="Download Document"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        );

      case 'assigned':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Assigned for Me</h2>

            <div className="bg-white rounded-lg border border-rose-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {assignedDocs.map((doc) => {
                  const StatusIcon = getStatusIcon(doc.document.status);
                  return (
                    <div key={doc.id} className="p-4 hover:bg-rose-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-rose-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.document.fileName}</h3>
                            <p className="text-sm text-gray-600">From: {doc.document.uploadedBy.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {doc.status}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Due: {doc.document.createdAt}</p>
                          </div>
                          <button 
                           onClick={()=>{
                             handleSignDocument(doc)
                           }}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Sign Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>

            <div className="bg-white rounded-lg border border-rose-200 p-6">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <Contact className="mx-auto h-12 w-12 text-rose-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Get in Touch</h3>
                  <p className="text-gray-600">Need help? We're here to assist you.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Describe your issue or question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>

                  <button className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-rose-200 px-6 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-rose-600">DocSign</h1>

          <div className="flex items-center space-x-3">
            {isSignedIn ? (
              <div className="flex items-center space-x-2">
                {
                  user.picture ? <img src={user.picture} className='rounded-full' height={30} width={30} /> : <User className="h-5 w-5 text-gray-600" />
                }
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsSignedIn(false)}}
                  className="text-sm text-rose-600 hover:text-rose-700 ml-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowSignUp(true)
                }}
                className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-rose-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeSection === item.id
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {/* Counter Badge */}
                  {item.count !== undefined && item.count > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {item.count > 99 ? '99+' : item.count}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>

      {showSignUp && <GoogleSignInOverlay onClose={setShowSignUp} />}
    </div>
  );
};

export default Dashboard;