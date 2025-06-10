export function FontSizeSelector({ setFontSize }) {
  const sizes = [20, 24, 28, 32, 36, 40];

  return (
    <div className="flex-1">
    
      <select
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="w-full p-1 border rounded text-sm border-none shadow-lg focus: outline-none"
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
    </div>
  );
}
