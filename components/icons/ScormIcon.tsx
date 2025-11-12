import React from 'react';

export const ScormIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 12.5v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.5" />
    <path d="M16 18h6" />
    <path d="m19 15 3 3-3 3" />
    <path d="M4 10h9" />
    <path d="M4 14h6" />
    <path d="M4 18h3" />
  </svg>
);
