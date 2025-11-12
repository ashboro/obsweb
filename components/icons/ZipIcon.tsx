
import React from 'react';

export const ZipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
    <path d="M10 9H8v1h2V9zm4 0h-2v1h2V9z" />
    <path d="M10 6H8v1h2V6zm4 0h-2v1h2V6z" />
    <path d="M10 3H8v1h2V3zm4 0h-2v1h2V3z" />
  </svg>
);
