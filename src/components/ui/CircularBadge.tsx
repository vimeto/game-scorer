
type CircularBadgeProps = {
  width?: string;
  height?: string;
  bgColor: string;
  textColor: string;
} & React.HTMLAttributes<HTMLDivElement>;

const CircularBadge: React.FC<CircularBadgeProps> = (props) => {
  const {
    width,
    height,
    className: inputClassName,
    bgColor,
    textColor,
    ...rest
  } = props;
  const className = `flex items-center justify-center ${width || ""} ${height || ""} rounded-full ${inputClassName || ""} bg-${bgColor} text-${textColor}`;

  return <div className={className} {...rest} />;
}

export default CircularBadge;
