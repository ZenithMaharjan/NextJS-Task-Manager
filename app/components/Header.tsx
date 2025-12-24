"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 ">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">My Website</h1>

        <div className="flex gap-10">
          <Link href="/" className="hover:underline px-2">
            Home
          </Link>
          <Link href="/about" className="hover:underline px-2">
            About
          </Link>
          <Link href="/contact" className="hover:underline px-2">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
