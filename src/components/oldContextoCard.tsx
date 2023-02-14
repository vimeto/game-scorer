import { useState } from "react";
import Input from "./ui/Input";

const ContextoCard: React.FC = () => {
  const [inputsValid, setInputsValid] = useState<{ first: boolean, second: boolean }>({ first: false, second: false });
  const [inputValues, setInputValues] = useState<{ first: string, second: string }>({ first: "", second: "" });

  const handleInput = (key: keyof typeof inputValues) => {
    return (a: string) => {
      const aNum = Number(a);
      if (!aNum || aNum === 0) {
        setInputsValid({ ...inputsValid, [key]: false });
        setInputValues({ ...inputValues, [key]: "" });
        return;
      }

      if (aNum >= 1000) return;

      setInputsValid({ ...inputsValid, [key]: true });
      setInputValues({ ...inputValues, [key]: a });
    };
  };

  return (
    <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center max-w-[250px] p-2 rounded gap-2">
      <h3 className="text-2xl font-bold text-center">Contexto</h3>
      <h3 className="text-xl font-bold text-center">Winner</h3>
      <div className="flex flex-row justify-center gap-4">
        <Input valid={inputsValid.first} id={"1"} placeholder={"5"} title={"Viivi"} value={inputValues.first} setValue={handleInput("first")} />
        <p className="py-2 px-4">-</p>
        <Input valid={inputsValid.second} id={"2"} placeholder={"3"} title={"Vilhelm"} value={inputValues.second} setValue={handleInput("second")} />
      </div>
      <div className="text-center">
        <button className={`bg-white/20 py-2 px-4 rounded-lg hover:bg-white/30 ${Object.values(inputsValid).every(input => input) ? "inline" : "invisible"}`}>
          Update
        </button>
      </div>
    </div>
  );
};

export default ContextoCard;
