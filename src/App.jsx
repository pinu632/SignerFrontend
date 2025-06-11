import { useState } from 'react'
import './App.css'

import  Canvas  from './Components/Canvas'
import {Routes,Route} from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import DocumentUpload from './Pages/Upload'



function App() {


  return (
  



     
           <Routes>
                  <Route path='/' element={<Dashboard/>}/>
                  <Route path='/upload' element={<DocumentUpload/>} />
                  <Route path='/:action/:documentId/:email' element={<Canvas/>} />
                      <Route path="/prepare/:documentId/:email" element={<PrepareRedirect />} />
           </Routes>
    
      
 
    
      

  )
}

export default App
