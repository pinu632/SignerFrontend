import { useState } from "react";

const cursiveFonts = [
  { name: "Allura", css: "'Allura', cursive" },
  { name: "Dancing Script", css: "'Dancing Script', cursive" },
  { name: "Great Vibes", css: "'Great Vibes', cursive" },
  { name: "Pacifico", css: "'Pacifico', cursive" },
  { name: "Satisfy", css: "'Satisfy', cursive" },
  { name: "Brush Script MT", css: "'Brush Script MT', cursive" }, // system font
];

export function FontSelector({setSelectedFont}) {
  const [selectedFont, setSelectedFontstyle] = useState(cursiveFonts[0].css);

  return (
    <div className="flex-1">
    
      <select
        onChange={(e) => {
            setSelectedFontstyle(e.target.value)
            setSelectedFont(e.target.value)
        }}
        value={selectedFont}
        className="w-full p-1 border rounded text-sm border-none shadow-lg focus: outline-none"
        style={{ fontFamily: selectedFont }}
      >
        {cursiveFonts.map((font, index) => (
          <option key={index} value={font.css} style={{ fontFamily: font.css }}>
            Signature
          </option>
        ))}
      </select>

     
    </div>
  );
}
