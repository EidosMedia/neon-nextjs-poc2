import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, Icon, ...props }: React.ComponentProps<"input"> & {
    Icon?: React.ReactNode;}) {
  return (
    <div className="relative h-fit w-fit">
       {Icon && <span className="absolute text-neutral-light-2 translate-y-[-50%] top-[50%] mx-2">{Icon}</span>}
        <input
        type={type}
        data-slot="input"
        className={cn(
            "text-base placeholder:text-neutral-light-2 selection:text-primary-foreground flex w-full min-w-0 rounded-xs border-1 border-neutral-primary bg-transparent py-3 transition-[color] outline-none",
            "hover:border-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-light-2",
            Icon ? 'pl-[36px]' : 'px-[9px]',
            className
            )}
            {...props}
        />
    </div>
  )
}

export { Input }
