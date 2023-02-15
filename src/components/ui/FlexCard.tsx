import React from "react";

type FlexCardProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const FlexCard: React.FC<FlexCardProps> = ({ children, className }) => {
  const finalClassName = `bg-gray-300/10 text-white hover:bg-gray-100/10 inline-flex flex-col items-center max-w-[250px] p-2 m-2 rounded gap-2 ${className || ""}`;

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
};

export default FlexCard;
