declare module '@myorg/ui' {
  import { ReactNode } from 'react';

  export function SharedButton(props: {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    onClick?: () => void;
    disabled?: boolean;
  }): JSX.Element;

  export function Card(props: { title?: string; children: ReactNode; footer?: ReactNode }): JSX.Element;

  export function Badge(props: {
    children: ReactNode;
    color?: 'blue' | 'green' | 'red' | 'amber' | 'gray';
  }): JSX.Element;
}
