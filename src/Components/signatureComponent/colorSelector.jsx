export function ColorSelector({ setFontColor }) {
  const colors = ["#000000", "#8B5CF6", "#EF4444", "#22C55E"]; // black, violet, red, green

  return (
    <div className="flex-1 flex justify-center items-center">
    
      <div className="flex gap-3">
        {colors.map((color) => (
          <div
            key={color}
            className="w-4 h-4 rounded-full cursor-pointer border-2 border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => setFontColor(color)}
          />
        ))}
      </div>
    </div>
  );
}
