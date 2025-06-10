import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FontSelector } from "./fontselector";
import { FontSizeSelector } from "./signatureComponent/fontsizeSelector";
import { ColorSelector } from "./signatureComponent/colorSelector";
import SignatureCanvas from 'react-signature-canvas';
import { useDispatch } from "react-redux";
import { addField, updateField } from "../redux/slices/DocumentSlice";

function SignaturePad({ setShowSignaturepad, setElements, id,  setEditElementId,signatureDataValue, isEditingMode = false, mode = 'type', setEditingMode }) {
    const [SignatureMode, setSignatureMode] = useState(isEditingMode ? mode : 'draw');
    const [signatureValue, setSignatureValue] = useState('signature');
    const [fontcolor, setFontColor] = useState('black');
    const [fontFamily, setFontFamily] = useState('Arial');
    const signRef = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isEditingMode && signatureDataValue) {
            setSignatureValue(signatureDataValue);
        }
    }, [isEditingMode, signatureDataValue]);

    const handleAccept = () => {
        if (SignatureMode === 'type') {
            if (!signatureValue || signatureValue.trim() === '') {
                alert("Please type your signature.");
                return;
            }

            console.log(signatureValue)

            const updatedElement = {
                id: isEditingMode ? id : Date.now(),
                type: 'signature',
                content: signatureValue,
                signatureMode:'type',
                fontFamily:'Allura'
            };

            if (isEditingMode) {
                console.log(id)
                dispatch(updateField({ id, updates: updatedElement }));
                setElements(prev =>
                    prev.map(el => (el.id === id ? { ...el, ...updatedElement } : el))
                );
                setEditElementId(null)
            } else {
                setElements(prev => [...prev, updatedElement]);
                dispatch(addField(updatedElement));
            }
        }

        if (SignatureMode === 'draw') {
            if (!signRef.current || signRef.current.isEmpty()) {
                alert("Please draw your signature.");
                return;
            }

            const imageUrl = signRef.current.getCanvas().toDataURL("image/png");

            const updatedImageElement = {
                id: isEditingMode ? id : Date.now(),
                type: 'image',
                content: imageUrl,
              
                signatureMode:'draw'
            };

            if (isEditingMode) {
                dispatch(updateField({ id, updates: updatedImageElement }));
                setElements(prev =>
                    prev.map(el => (el.id === id ? { ...el, ...updatedImageElement } : el))
                );
                setEditElementId(null)
                setEditingMode(false)
            } else {
                setElements(prev => [...prev, updatedImageElement]);
                dispatch(addField(updatedImageElement));
            }
        }

        setShowSignaturepad(false);
        setEditingMode(false);
    };

    return (
        <div className="h-screen w-screen bg-black/75 flex justify-center items-center absolute z-50 ">
            <div className="h-[450px] w-[650px] bg-white rounded-xl flex flex-col">
                <div className="w-full px-5 py-3 font-bold text-gray-600 flex justify-between">
                    <div>Add your Signature</div>
                    <X
                        onClick={() => {
                            setShowSignaturepad(false);
                            setEditingMode(false);
                        }}
                        size={30}
                        className="text-gray-600 cursor-pointer"
                    />
                </div>

                <div className="w-full p-1 text-gray-600 flex shadow-lg">
                    <div className="w-full p-1 relative text-gray-600 flex size-sm">
                        <div
                            onClick={() => setSignatureMode("draw")}
                            className="flex-1 flex justify-center items-center cursor-pointer py-2"
                        >
                            Draw
                        </div>
                        <div
                            onClick={() => setSignatureMode("type")}
                            className="flex-1 flex justify-center items-center cursor-pointer py-2"
                        >
                            Type
                        </div>
                        <div
                            className="absolute bottom-[-5px] left-0 h-0.5 bg-violet-500 transition-all duration-300"
                            style={{
                                width: "50%",
                                transform: SignatureMode === "draw" ? "translateX(0%)" : "translateX(100%)",
                            }}
                        />
                    </div>
                </div>

                <div className="w-full h-[50%]">
                    {SignatureMode === "type" ? (
                        <TypeSignaturemodeDiv
                            signatureValue={signatureValue}
                            setSignatureValue={setSignatureValue}
                            setTextColor={setFontColor}
                            setTextFamily={setFontFamily}
                            id={id}
                            isEditingMode={isEditingMode}
                        />
                    ) : (
                        <SignatureCanvasPad signRef={signRef} />
                    )}
                </div>

                <div className="text-[10px] text-gray-600 px-6 py-2">
                    By electronically signing this document, I acknowledge that my signature and initials hold the same legal weight as my handwritten signature and are considered original on all documents, including binding agreements. I also accept the
                    <span className="text-violet-600 font-medium cursor-pointer mx-1">Terms of Use</span>
                    and
                    <span className="text-violet-600 font-medium cursor-pointer mx-1">Privacy Policy</span>.
                </div>

                <div className="flex justify-between px-6 py-4">
                    <button
                        onClick={() => {
                            setShowSignaturepad(false);
                            setEditingMode(false);
                        }}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700 transition"
                    >
                        Accept & Sign
                    </button>
                </div>
            </div>
        </div>
    );
}

function TypeSignaturemodeDiv({ signatureValue, setSignatureValue, setTextColor, setTextFamily, isEditingMode, id }) {
    const [selectedFont, setSelectedFont] = useState('Allura');
    const [fontcolor, setFontColor] = useState('black');

    useEffect(() => {
        setTextFamily(selectedFont);
    }, [selectedFont]);

    useEffect(() => {
        setTextColor(fontcolor);
    }, [fontcolor]);

    return (
        <div className="h-full w-full py-2 ">
            <div className="w-full h-[40px] flex gap-2 p-4 box-border items-center">
                <FontSelector setSelectedFont={setSelectedFont} className="flex-1" />
                <ColorSelector className="flex-1" setFontColor={setFontColor} />
                <FontSizeSelector className="flex-1" />
            </div>

            <input
                type="text"
                className="w-full p-5 h-[80%] text-[50px] bg-gray-200 text-center focus:outline-none"
                style={{ fontFamily: selectedFont, color: fontcolor }}
                onChange={(e) => setSignatureValue(e.target.value)}
                value={signatureValue}
            />
        </div>
    );
}

function SignatureCanvasPad({ signRef }) {
    const handleClear = () => {
        signRef.current?.clear();
    };

    return (
        <div className="w-full">
            <div className="flex p-2">
                <button
                    onClick={handleClear}
                    className="px-3 py-1 text-gray-600 text-sm rounded "
                >
                    Clear
                </button>
            </div>
            <div className="h-full w-full bg-gray-200 rounded shadow border border-gray-200">
                <SignatureCanvas
                    canvasProps={{ width: 600, height: 150, className: 'sigCanvas' }}
                    ref={signRef}
                />
            </div>
        </div>
    );
}

export default SignaturePad;
