"use client";

import Link from "next/link";

interface LogoProps {
  title: string;
  href: string;
  onClick?: () => void;
}

export default function Logo({ title, href, onClick }: LogoProps) {
  return (
    <Link href={href} onClick={onClick}>
      <h1 className="text-xl font-bold cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap">
        {title}
      </h1>
    </Link>
  );
}
