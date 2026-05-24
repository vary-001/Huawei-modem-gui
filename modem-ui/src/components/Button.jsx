export default function Button({ children }) {
  return (
    <button
      className="
        px-4 py-2 
        bg-primary 
        text-black 
        font-semibold 
        rounded-lg 
        hover:opacity-80
        active:scale-95
      "
    >
      {children}
    </button>
  );
}