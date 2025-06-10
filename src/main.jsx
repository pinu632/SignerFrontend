import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { pdfjs } from 'react-pdf';
import { authContext, AuthProvider } from './context/authContext.jsx';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


createRoot(document.getElementById('root')).render(

  <AuthProvider >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} >

        <App />

      </PersistGate>
    </Provider>

  </AuthProvider>

)
