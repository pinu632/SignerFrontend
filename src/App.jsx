import { useState } from 'react'
import './App.css'

import  Canvas  from './Components/Canvas'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import DocumentUpload from './Pages/Upload'



function App() {


  return (
    <>
    
{/* 
      <Canvas/> */}
      {/* <SignaturePad/> */}


      <BrowserRouter>
           <Routes>
                  <Route path='/' element={<Dashboard/>}/>
                  <Route path='/upload' element={<DocumentUpload/>} />
                  <Route path='/:action/:documentId/:email' element={<Canvas/>} />
                  
           </Routes>
      </BrowserRouter>
      
 
    
      
    </>
  )
}

export default App
