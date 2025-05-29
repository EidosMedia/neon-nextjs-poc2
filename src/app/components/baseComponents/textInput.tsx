import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  Icon,
  ...props
}: React.ComponentProps<'input'> & {
  Icon?: React.ReactNode;
}) {
  return (
    <div className="relative h-fit grow-1 font-gabarito">
      {Icon && <span className="absolute text-neutral-light-2 translate-y-[-50%] top-[50%] left-0 mx-2">{Icon}</span>}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'text-base placeholder:text-neutral-light-2 selection:text-primary-foreground flex w-full min-w-0 rounded-xs border-1 border-neutral-primary bg-transparent py-3 transition-[color] outline-none h-[32px]',
          'hover:border-primary',
          'focus:ring-1 focus:ring-primary ',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-light-2',
          Icon ? 'pl-[36px] pr-[9px]' : 'px-[9px]',
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
