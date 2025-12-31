"use client";

import { Menu } from "lucide-react";

interface HamburgerButtonProps {
  onClick: () => void;
}

export default function HamburgerButton({ onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-white/10 rounded-lg transition"
      aria-label="Toggle menu"
    >
      <Menu size={24} />
    </button>
  );
}
