import type { ReactNode, SVGProps } from "react";

type IconName = 
  | "sun" 
  | "moon" 
  | "calendar" 
  | "edit" 
  | "close"
  | "check"
  | "trash"
  | "plus"
  | "search";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string; // Facilita o ajuste rápido de tamanho quando necessário
}

const paths: Record<IconName, ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.75v2M12 19.25v2M4.76 4.76l1.42 1.42M17.82 17.82l1.42 1.42M2.75 12h2M19.25 12h2M4.76 19.24l1.42-1.42M17.82 6.18l1.42-1.42" /></>,
  moon: <path d="M20.2 15.2A7.5 7.5 0 0 1 8.8 3.8 7.5 7.5 0 1 0 20.2 15.2Z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  edit: <path d="m4 16.5-.7 3.7 3.7-.7L18.8 7.7a2.1 2.1 0 0 0-3-3L4 16.5ZM14.5 6.5l3 3" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  // Novos ícones úteis para o seu SaaS de To-Do:
  check: <path d="M20 6 9 17l-5-5" />,
  trash: <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
};

export function Icon({ name, size = 24, className = "", ...props }: IconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      aria-hidden="true" 
      width={size}
      height={size}
      className={`icon icon-${name} ${className}`}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}