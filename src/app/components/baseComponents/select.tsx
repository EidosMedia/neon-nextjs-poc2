import { cn } from "@/lib/utils"

type Option = {
    value: string;
    text: string;
  };
  

  type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
  };

const Select:React.FC<SelectProps> = ({className, options, ...props}) => {
  return (
    <select
    className={cn(
                "flex w-full min-w-0 rounded-xs border-1 border-neutral-primary bg-transparent py-[10px] px-2 text-base font-bold transition-[color] outline-none",
                "hover:border-primary",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-light-2 disabled:text-neutral-light-2",
                className
                )}
                {...props}
    >
        {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.text}
        </option>
      ))}
    </select>
  )
}

export default Select