import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center w-fit gap-2 p-[8px] whitespace-nowrap rounded-xs font-semibold disabled:pointer-events-none [&_svg]:pointer-events-none [&>svg]:size-4 [&>svg:only-child]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:text-background active:ring-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:text-neutral-light h-[32px]',
  {
    variants: {
      variant: {
        default:
          'bg-primary border-1 border-primary text-background hover:bg-primary-light hover:text-neutral-primary active:bg-primary-dark disabled:bg-primary-lightest disabled:border-0 disabled:border-primary-light disabled:text-neutral-light',
        secondary:
          'bg-neutral-lightest text-primary border-1 border-primary hover:bg-primary-light hover:text-primary-dark active:bg-primary',
        ghost:
          'bg-neutral-lightest text-neutral-primary border-primary hover:bg-primary-light hover:text-primary-dark active:bg-primary',
        title:
          'bg-neutral-lightest text-primary border-primary hover:bg-primary-light hover:text-primary-dark active:bg-primary',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
      },
    },
    compoundVariants: [
      {
        variant: 'title',
        size: 'sm',
        class: 'text-lg', // 16px
      },
      {
        variant: 'title',
        size: 'default',
        class: 'text-2xl', // 20px
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
