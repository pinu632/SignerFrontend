import { useState, useRef, useEffect } from "react";
import { CircleX } from "lucide-react";
import SignerDropdown from "./signerComponent/signerEmailSelector";
import { useDispatch, useSelector } from "react-redux";
import { removeField, updateField } from "../redux/slices/DocumentSlice";
import axios from "axios";
import baseUrl from "../../config";





// const signers = [
//   { email: "alice@example.com" },
//   { email: "bob@example.com" },
//   { email: "carol@example.com" },
// ];


export function Draggable({ initX,  initY ,onPositionChange, children, parentRef, id,setElements, setFontSize, action ,onSizeChange ,type}) {
  const [pos, setPos] = useState({ x: initX, y: initY });
  const [fontSize,setFontSizeData] = useState(16)
  const [isEditing, setIsEditing] = useState(true);
  const dispatch = useDispatch()

  const signers = useSelector(state=>state.document.document.signers)


  const [selectedSigner, setSelectersigner] = useState('pinu@example.com')

  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elemRef = useRef(null);
  const boxRef = useRef(null);

  const handleDelete = async () =>{

    setElements((prev)=>prev.filter(e=>e.id !== id))
    await axios.post(`${baseUrl}/document/deleteField/${id}`)

    dispatch(removeField(id))
    
  }

  // const handleAssigned = (signerPerson)=>{

  //   dispatch(updateField({id:id,updates:{signer:signerPerson}}))

  // }

  // useEffect(()=>{
  //   handleAssigned(selectedSigner)
  // },[selectedSigner])

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  // Dragging handlers
  const onPointerDown = (e) => {
    draggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    if (!parentRef.current || !elemRef.current) return;

    const parentRect = parentRef.current.getBoundingClientRect();
    const elemRect = elemRef.current.getBoundingClientRect();

    let newX = e.clientX - dragStartRef.current.x;
    let newY = e.clientY - dragStartRef.current.y;

   

    // Clamp to stay inside parent bounds
    newX = clamp(newX, 0, parentRect.width - elemRect.width);
    newY = clamp(newY, 0, parentRect.height - elemRect.height);

    setPos({ x: newX, y: newY });
    if (onPositionChange) onPositionChange(newX, newY);
  };

  const onPointerUp = (e) => {
    draggingRef.current = false;
   
    e.target.releasePointerCapture(e.pointerId);
  };

  // Resizing handlers
  const onMouseDownResize = (e, corner) => {
    // e.stopPropagation();

    
     draggingRef.current= false
    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = boxRef.current.offsetWidth;
    const startHeight = boxRef.current.offsetHeight;
    
   
    
      

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

       
   

      // Update size based on which corner is dragged
      if (corner === "bottom-right") {
        newWidth = startWidth + dx;
        newHeight = startHeight + dy;
      } else if (corner === "bottom-left") {
        newWidth = startWidth - dx;
        newHeight = startHeight + dy;
      } else if (corner === "top-right") {
        newWidth = startWidth + dx;
        newHeight = startHeight - dy;
      } else if (corner === "top-left") {
        newWidth = startWidth - dx;
        newHeight = startHeight - dy;
      }

      // Minimum size limits
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);

      // Apply new size
      boxRef.current.style.width = `${newWidth}px`;
      boxRef.current.style.height = `${newHeight}px`;

      // Update font size relative to height (customize as needed)
     
      
    if (type === "text" || type === 'signature') {
      // Adjust font size for text
      const newFontSize = 60 * (newHeight / 100);
      boxRef.current.style.fontSize = `${newFontSize}px`;
      if (onSizeChange) onSizeChange(newFontSize);
      setFontSizeData(newFontSize)
    } else if (type === "image" ) {
      // For image, pass new dimensions up or directly apply styles to image
      if (onSizeChange) onSizeChange({ width: newWidth, height: newHeight });
    }
    };

    const onMouseUp = () => {

     
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={elemRef}
      onBlur={() => setIsEditing(false)}
      onClick={() => setIsEditing((prev) => !prev)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        touchAction: "none",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div
        ref={boxRef}
        className="p-2 border border-blue-300 relative flex items-center justify-center"
        style={{
          backgroundColor: "transparent",
          border: isEditing ? "1px solid blue" : "none",
          left: 0,
          top: 0,
          width: "auto",
          height: "auto",
          fontSize: "60px",
          minWidth: "200px",
          minHeight: "30px",
          boxSizing: "border-box",
        }}
      >
        {children}

        {
          (!(action === 'sign')) &&  <div 
               onClick={()=>{
                setIsEditing(true)
               }}
               className="absolute  top-[-22px] left-[-6px] text-white cursor-pointer bg-gray-700 p-1 rounded-2xl"
            >
                <SignerDropdown signers={signers} onSelect={setSelectersigner} id={id}/>
            </div>
        }

        {isEditing && (
          <>
            <div>
              <CircleX  size={15}
              onClick={handleDelete}
               className="absolute  top-[-22px] right-[-10px] text-red-600 cursor-pointer"
              />
            </div>
           
            <div
              onMouseDown={(e) => onMouseDownResize(e, "top-left")}
              className="h-2 w-2 rounded bg-blue-500 absolute top-[-4px] left-[-3px] cursor-nwse-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownResize(e, "bottom-left")}
              className="h-2 w-2 rounded bg-blue-500 absolute bottom-[-4px] left-[-3px] cursor-nwse-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownResize(e, "top-right")}
              className="h-2 w-2 rounded bg-blue-500 absolute top-[-4px] right-[-3px] cursor-nwse-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownResize(e, "bottom-right")}
              className="h-2 w-2 rounded bg-blue-500 absolute bottom-[-4px] right-[-3px] cursor-nwse-resize"
            />
          </>
        )}
      </div>
    </div>
  );
}

