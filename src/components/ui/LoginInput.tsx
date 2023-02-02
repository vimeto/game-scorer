import React from "react";

export type Props = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >

export const LoginInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, type, name, onChange, autoComplete, placeholder, id }: Props, ref) => {
    return (
      <div className="relative w-60">
        <input
          type={type}
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={" "}
          autoComplete={autoComplete}
          name={name}
          className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-gray-600/10 rounded-lg border-1 border-gray-100/60 appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 peer"
          />
        <label
          htmlFor={id}
          className={`
            absolute rounded text-md text-gray-100/90 bg-[#C7B8EA] font-bold
            duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 left-1
            peer-focus:px-2 peer-focus:text-white peer-focus:bg-[#C7B8EA] peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4
            peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent
          `}>
            {placeholder}
        </label>
      </div>
    );
  }
);

LoginInput.displayName = "Input";
