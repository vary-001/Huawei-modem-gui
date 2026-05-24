export default function Input(props) {
  return (
    <input
      {...props}
      className="
        bg-black
        border 
        border-zinc-700
        text-white
        px-3 py-2
        rounded-lg
        outline-none
        focus:border-primary
        focus:ring-1
        focus:ring-primary
      "
    />
  );
}