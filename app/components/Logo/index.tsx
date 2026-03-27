"use client";

import Link from "next/link";

interface LogoProps {
  title: string;
  href: string;
  onClick?: () => void;
  className?: string;
}

export default function Logo({ title, href, onClick, className = "" }: LogoProps) {
  return (
    <Link href={href} onClick={onClick}>
      <h1
        className={`text-xl font-bold cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap ${className}`}
      >
        {title}
      </h1>
    </Link>
  );
}
