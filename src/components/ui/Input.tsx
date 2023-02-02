import { type InputTypes } from "../types";

const Input: React.FC<InputTypes> = ({ valid, id, placeholder, title, value, setValue }) => {
  const inputClassName = () => {
    const baseClass = "w-16 text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5";

    if (valid) { return `${baseClass} ring-green-500 border-green-500`; }
    return `${baseClass} ring-red-500 border-red-500`;
  };

  return (
    <div>
      <label htmlFor={`second_player${id}`} className="text-center block mb-1 text-sm font-medium text-white">
        {title}
      </label>
      <input
        type="text"
        id={`second_player${id}`}
        className={inputClassName()}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        />
    </div>
  );
};

export default Input;
