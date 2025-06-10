import { Type, Image, PenTool, Move, Download } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Draggable } from './Draggable'; // your draggable component
import PdfViewer from './pdfjs';
import SignaturePad from './SignaturePad';
import { parseColorStringToRgb } from '../Utils/CovertToColor';
import fontkit from '@pdf-lib/fontkit';
import { Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addField, removeField, updateField } from '../redux/slices/DocumentSlice';
import { debounce, update } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';

import {
    MapPin,
    ArrowLeft,
    User,
    FileSignature,
    Image as ImageIcon,
    Type as TextIcon,
    CheckCircle,
    X
} from "lucide-react";
import { SaveFieldsMetaData } from '../services/sendFieldstoSave';
import baseUrl from '../../config';


// PDF page size in points (A4)
const PDF_WIDTH = 595.276;
const PDF_HEIGHT = 841.89;

export default function Canvas() {
    const [elements, setElements] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [pdfScale, setPdfScale] = useState(1.6);
    const [showSignaturePad, setShowSignaturepad] = useState(false)
    const [showDetails, setShowDetails] = useState(null)
    const [tempIdValMap, setValMap] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const parentRef = useRef(null);
    const {documentId} = useParams()

    // Success popup state
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isEditMode, setEditMode] = useState(false)
    const [editElementId, setEditElementId] = useState(null)
    const [signatureVal, setSignatureVal] = useState(null)
    const [editTextElementId, setEditTextElementId] = useState(null)
    const [signatureEditMode, setSignatureEditMode] = useState('draw');


      const [pdfUrl, setPdfUrl] = useState(null);
     const [loading, setLoading] = useState(true);

   


     useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const response = await fetch(`${baseUrl}/document/getUrl/:id?id=${documentId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch document');

        console.log('✅ fileUrl from API:', data?.fileUrl);

        if (data?.fileUrl) {
          setPdfUrl(data.fileUrl);
        } else {
          throw new Error('fileUrl not found in response');
        }
      } catch (err) {
        console.error('❌ Error fetching PDF URL:', err);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchPdfUrl();
    } else {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (pdfUrl) {
      console.log('✅ Updated PDF URL in state:', pdfUrl);
    }
  }, [pdfUrl]);

 



    const { action } = useParams()

    const dispatch = useDispatch()
    const navigate = useNavigate();

   

    const DocId = useSelector(state => state.document?.document?._id)
    const DocUrl = useSelector(state => state.document?.document?.fileUrl)
    const fields = useSelector(state => state.document.fields)

    // Mock these for the demo - replace with your actual selectors
   
 const prevFieldsRef = useRef();

    useEffect(() => {
        console.log("Current fields:", fields);
        console.log("Previous fields (from ref):", prevFieldsRef.current);

        if (prevFieldsRef.current === fields) {
            console.log("FIELDS REFERENCE HAS NOT CHANGED.");
        } else {
            console.log("FIELDS REFERENCE HAS CHANGED! useEffect is running.");
        }

        // Update the ref for the next render
        prevFieldsRef.current = fields;

        // You can perform other actions here that depend on the new 'fields' data
    });

    // Success popup component
    const SuccessPopup = () => {
        if (!showSuccessPopup) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-800">Success!</h3>
                        </div>
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 mb-6">{successMessage}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                navigate('/');
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Continue
                        </button>
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Stay Here
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const tools = [
        { id: 'text', name: 'Text', icon: Type, color: 'bg-rose-100 text-rose-700' },

        { id: 'signature', name: 'Signature', icon: PenTool, color: 'bg-red-100 text-red-700' },
    ];

   useEffect(() => {
    
    if (fields && fields.length > 0) {
        const flatFields = fields.flat();

        // Map over flatFields to rename field_id to id
        const transformedFields = flatFields.map(el => {
            // Create a new object to avoid direct mutation of the original element
            const newEl = { ...el }; // Copy all existing properties

            // Check if field_id exists and is not undefined, null, etc.
            if (newEl.field_id !== undefined) {
                newEl.id = newEl.field_id; // Assign the value of field_id to id
                delete newEl.field_id; // Remove the old field_id property
            }
            return newEl;
        });

        console.log(transformedFields); // Log the transformed array
        setElements(transformedFields); // Set the state with the transformed array
    }
}, []);

    useEffect(() => {
        console.log("Elements now:", elements);
    }, []);

const handleSaveSigner = async () => {
    setIsLoading(true);
    

    console.log(fields)

    const transformedFields = fields.map(field => {
        console.log(field)
        const { id, _id, ...rest } = field; // Destructure _id explicitly

        let newFieldData= {};
        if(id){
         newFieldData = {
            ...rest,
            field_id: id,
        }
    }else{
        newFieldData={
            ...field
        }
    }

        // Only include _id if it exists, indicating an existing document
        if (_id) {
            newFieldData._id = _id;
        }

        return newFieldData;
    });

    console.log(transformedFields);

    try {
        await SaveFieldsMetaData(DocId, transformedFields);
        
        // Show success popup
        const message = (action == 'edit' || action === 'uploaded') 
            ? 'Document sent for signing successfully!' 
            : 'Document saved successfully!';
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        
    } catch (error) {
        console.error("Error saving signer fields:", error);
        // You can add an error popup here if needed
        alert("Failed to save fields. Please try again.");
    } finally {
        setIsLoading(false);
    }
};


    const handleDelete = (id) => {

        setElements((prev) => prev.filter(e => e.id !== id))
        dispatch(removeField(id))

    }

    const handleAddElement = (tool) => {
        if (tool.id === 'text' && inputText.trim()) {
            const newElement = {
                id: Date.now(),
                type: 'text',
                content: inputText,
                x: 50, // initial position inside container
                y: 50,
                fontSize: 10,
                fontFamily: 'Arial',        // 🆕 default font
                color: '#000000',
                signer: ''          // 🆕 default color (black)
            };


            setElements((prev) => [...prev, newElement]);
            dispatch(addField(newElement))
            setInputText('');
            setShowInput(false);
        }
    };

    const handleAddSignature = () => {
        const newElement = {
            id: Date.now(),
            type: 'signature',
            content: '', // Wait for user input
            x: 50,
            y: 50 + elements.length * 20, // staggered placement
            fontSize: 10,
            fontFamily: 'Arial',
            color: '#000000',
            signer: '',
            width: 200,
            height: 100,
            rotation: 0,
            signatureMode: 'type'
        };

        setElements((prev) => [...prev, newElement]);
        dispatch(addField(newElement));

        setEditMode(false)
    };



    //     const debouncedUpdate = useCallback(
    //     debounce((id, updates) => {
    //         console.log(id,updates)
    //       dispatch(updateElement({ id, updates }));
    //     }, 300),
    //     [dispatch]
    //   );

    const updateElement = (id, updates) => {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
        );

        // console.log(updates)

        //   debouncedUpdate(id,updates)



    };

    const handleExportPDF = async () => {
        const existingPdfBytes = await fetch(
            DocUrl
        ).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[0];


        //

        pdfDoc.registerFontkit(fontkit);

        // 1. Fetch the TTF font
        const fontBytes = await fetch('/fonts/Allura-Regular.ttf').then((res) =>
            res.arrayBuffer()
        );

        // 2. Embed the font in the PDF
        const alluraFont = await pdfDoc.embedFont(fontBytes);

        for (const el of elements) {
            // Convert screen pixel coordinates to PDF points
            const pdfX = el.x / pdfScale;
            const pdfY = page.getHeight() - el.y / pdfScale; // invert Y axis

            switch (el.type) {
                case 'text': {
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    page.drawText(el.content, {
                        x: pdfX,
                        y: pdfY,
                        size: el.fontSize || 16,
                        font: alluraFont,
                        color: parseColorStringToRgb(el.color),
                    });

                    break;
                }
                case 'signature': {
                    page.drawLine({
                        start: { x: pdfX, y: pdfY },
                        end: { x: pdfX + 100, y: pdfY - 50 },
                        thickness: 1,
                        color: rgb(0, 0, 0),
                    });
                    break;
                }
                case 'image': {
                    if (el.content.startsWith('data:image')) {
                        const imgBytes = await fetch(el.content).then((res) => res.arrayBuffer());
                        const img = await pdfDoc.embedPng(imgBytes);
                        page.drawImage(img, {
                            x: pdfX,
                            y: pdfY - (el.height || 100),
                            width: el.width || 100,
                            height: el.height || 100,
                        });
                    }
                    break;
                }
            }
        }

        const modifiedPdf = await pdfDoc.save();
        const blob = new Blob([modifiedPdf], { type: 'application/pdf' });
        saveAs(blob, 'modified.pdf');
    };


     if (loading) return <p>Loading...</p>;
     if (!pdfUrl) return <p>PDF not found or invalid document ID.</p>;

    return (
        <div className="flex h-screen bg-gradient-to-br from-rose-50 to-pink-50">
            {/* Success Popup */}
            <SuccessPopup />
            
            {/* Sidebar */}
            <div className="w-72 bg-white shadow-xl border-r border-rose-100 text-sm">
                {/* Header */}
                <div className="p-4 border-b border-rose-100 bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-between">
                    <button onClick={() => {
                        navigate('/')
                        handleSaveSigner()
                    }

                    }
                        className="text-white hover:text-rose-200 mr-2">
                        <ArrowLeft size={20} className='cursor-pointer' />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Design Tools</h2>
                        <p className="text-rose-100 text-xs">Add elements to your document</p>
                    </div>
                </div>

                {/* Tools */}
                <div className="p-4 space-y-3">
                    {tools.map((tool) => {
                        const IconComponent = tool.icon;
                        return (
                            <div key={tool.id} className="mb-2">
                                <button
                                    className={`w-full p-2 rounded-lg border ${activeTool === tool.id
                                        ? 'border-rose-500 bg-rose-50'
                                        : 'border-gray-200 bg-white'
                                        } hover:scale-[1.02] hover:shadow transition-all duration-200`}
                                    onClick={() => {
                                        setActiveTool(tool.id);
                                        if (tool.id === 'text') setShowInput((prev) => !prev);
                                        if (tool.id === 'signature') {

                                            handleAddSignature()
                                        };
                                    }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-2 rounded-md ${tool.color}`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 text-sm">{tool.name}</h3>
                                            <p className="text-xs text-gray-500">Add {tool.name.toLowerCase()}</p>
                                        </div>
                                    </div>
                                </button>

                                {showInput && tool.id === 'text' && (
                                    <div className="mt-2 space-y-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border rounded border-rose-400 focus:outline-none"
                                            placeholder="Enter text"
                                        />
                                        <button
                                            className="w-full px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
                                            onClick={() => handleAddElement(tool)}
                                        >
                                            Add Text
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Export */}
                    <div className="pt-3 border-t border-rose-100 flex flex-col gap-2">
                        <button
                            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center space-x-2"
                            onClick={handleExportPDF}
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PDF</span>
                        </button>
                        <button
                            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center space-x-2"
                            onClick={handleSaveSigner}
                        >
                            <Download className="w-4 h-4" />
                            <span>{isLoading ? "Sending" : `${(action == 'edit'|| action === 'uploaded')?'Send for Signature':'Save Document'}`}</span>
                        </button>
                    </div>
                </div>

                {/* Elements List */}
                <div className="p-4 border-t border-rose-100">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                        <Move className="w-4 h-4 mr-1 text-rose-500" />
                        Elements ({elements.length})
                    </h3>

                    {elements.length === 0 && (
                        <p className="text-xs text-gray-500">No elements added yet</p>
                    )}

                    <div

                        className="space-y-2 mt-1 flex flex-col overflow-y-scroll">
                        {elements.map((el) => (
                            <div key={el.id} className="mb-2 border border-gray-200 rounded bg-gray-50">
                                <div
                                    onClick={() => {
                                        if (showDetails === el.id) {
                                            setShowDetails(null);
                                        } else {
                                            setShowDetails(el.id);
                                        }
                                    }}
                                    className="flex justify-between items-center p-2 cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        {el.type === "image" && (
                                            <img
                                                src={el.content}
                                                alt="preview"
                                                className="w-8 h-8 object-cover rounded border border-gray-300"
                                            />
                                        )}
                                        <div className="flex flex-col">
                                            <span className="capitalize text-gray-700 font-medium text-xs">{el.type}</span>
                                            <span className="text-[10px] text-gray-500 truncate max-w-xs">{el.signer || "No signer"}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent parent click
                                            handleDelete(el.id);
                                        }}
                                        className="text-rose-500 hover:text-rose-600 focus:outline-none"
                                        aria-label="Delete element"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {showDetails === el.id && (
                                    <div className="p-2 border-t border-gray-200">
                                        <SidebarDetails el={el} />
                                    </div>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            </div>


            {/* Canvas Area */}
            <div className="flex-1 p-6 overflow-auto">
                <div
                    ref={parentRef}
                    className="relative mx-auto bg-white shadow-lg"
                    style={{
                        width: `${PDF_WIDTH}px`,
                        height: `${PDF_HEIGHT}px`,
                        border: '1px solid #ccc',
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: 'white',
                        margin: '20px auto',
                    }}
                >
                    <PdfViewer
                        url={pdfUrl}
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                        onScaleChange={setPdfScale}
                    />
                    {console.log(elements)}

                    {elements.map((el) => (
                        <Draggable
                            key={el.id}
                            id={el.id}
                            action={action}
                            initX={el.x}
                            initY={el.y}
                            type={el.type}
                            parentRef={parentRef}
                            setElements={setElements}
                            onPositionChange={(x, y) => {
                                updateElement(el.id, { x, y });
                                dispatch(updateField({ id: el.id, updates: { x, y } }));
                            }}
                            onSizeChange={(size) => {
                                if (el.type === 'text' || el.type === 'signature') {
                                    updateElement(el.id, { fontSize: size });
                                    dispatch(updateField({ id: el.id, updates: { fontSize: size } }));
                                } else if (el.type === 'image') {
                                    updateElement(el.id, { width: size.width, height: size.height });
                                    dispatch(updateField({ id: el.id, updates: { width: size.width, height: size.height } }));
                                }
                            }}
                        >
                            {/* TEXT or TYPE SIGNATURE */}
                            {(el.type === 'text' || (el.type === 'signature' && el.signatureMode === 'type')) && (
                                <div
                                    className="absolute cursor-move select-none"
                                    style={{
                                        fontSize: `${el.fontSize}px`,
                                        color: el.color,
                                        fontFamily: el.fontFamily,
                                        height: 'auto',
                                        width: 'auto',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        if (el.type === 'signature') {
                                            setShowSignaturepad(true);
                                            setEditMode(true);
                                            setEditElementId(el.field_id);
                                            setSignatureEditMode('type');
                                        } else if (el.type === 'text') {
                                            setEditMode(true);
                                            setEditTextElementId(el.id);
                                            console.log(el.id)
                                            setValMap((prev) => ({ ...prev, [el.id]: el.content }));
                                        }
                                    }}
                                >
                                    {isEditMode && el.type === 'text' && editTextElementId === el.id ? (
                                        <input
                                            key={el.id}
                                            value={tempIdValMap[el.id]}
                                            onChange={(e) => {
                                                setValMap((prev) => ({ ...prev, [el.id]: e.target.value }));
                                                console.log(editTextElementId)
                                            }}
                                            onBlur={ () => {
                                                console.log(tempIdValMap[el.id])
                                                dispatch(updateField({ id: el.id, updates: { content: tempIdValMap[el.id] } }));
                                                
                                                updateElement(el.id, { content: tempIdValMap[el.id] });
                                                setEditTextElementId(null);
                                                console.log(fields)
                                                setEditMode(false);
                                            }}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                outline: 'none',
                                                border: 'none',
                                            }}
                                        />
                                    ) : (
                                        el.content
                                    )}
                                </div>
                            )}

                            {/* PLACEHOLDER SIGNATURE IMAGE (draw mode with no content) */}
                            {el.type === 'signature' && !el.content && (
                                <img
                                    src="/11532503.png"
                                    alt="Sign Here"
                                    key={el.id}
                                    className="h-12"
                                    draggable={false}
                                    onClick={() => {
                                        setShowSignaturepad(true);
                                        setEditMode(true);
                                        setEditElementId(el.id);
                                        setSignatureEditMode('draw');
                                    }}
                                />
                            )}

                            {/* IMAGE TYPE */}
                            {el.type === 'image' && (
                                <img
                                    src={el.content}
                                    alt=""
                                    draggable={false}
                                    className="cursor-move select-none"
                                    style={{
                                        width: el.width,
                                        height: el.height,
                                        objectFit: 'contain',
                                        userSelect: 'none',
                                        pointerEvents: 'auto',
                                        display: 'block',
                                    }}
                                />
                            )}
                        </Draggable>
                    ))}


                </div>
            </div>

            {
                showSignaturePad && <SignaturePad
                    setShowSignaturepad={setShowSignaturepad}
                    isEditingMode={isEditMode}
                    id={editElementId}
                    setElements={setElements}
                    setEditingMode={setEditMode}
                    signatureDataValue={signatureVal}
                    setEditElementId={ setEditElementId}

                    mode={signatureEditMode}
                />
            }
        </div>
    );
}





// import { FileSignature, MapPin, User, TextIcon, ImageIcon } from "lucide-react";

function SidebarDetails({ el }) {
    if (!el) return null; // nothing to show

    return (
        <div className="w-56 p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded shadow-sm font-sans text-xs select-none">
            <h2 className="text-sm font-semibold mb-2 text-rose-600 flex items-center gap-1">
                <FileSignature className="w-4 h-4 text-rose-500" />
                <span>Element Details</span>
            </h2>

            <div className="mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>
                    <b className="text-rose-700">X:</b> {Math.round(el.x) ?? "-"} , <b className="text-rose-700">Y:</b> {Math.round(el.y) ?? "-"}
                </span>
            </div>

            <div className="mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span>
                    <b className="text-rose-700">Signer:</b> {el.signer || "Not assigned"}
                </span>
            </div>

            <div className="mb-1 flex items-center gap-1">
                <TextIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>
                    <b className="text-rose-700">Type:</b> {el.type || "Unknown"}
                </span>
            </div>

            {el.content && !el.type === 'image' && (
                <div className="mb-1 flex items-center gap-1 break-words">
                    <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span>
                        <b className="text-rose-700">Value:</b> <i className="text-rose-700">{el.content}</i>
                    </span>
                </div>
            )}
        </div>
    );
}