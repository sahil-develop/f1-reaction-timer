'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'F1 TIMER' },
  { href: '/red-green-light', label: 'RED / GREEN' },
  { href: '/timer', label: 'ALARM TIMER' },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur border-b border-[#1e1e1e]">
      <div className="max-w-lg mx-auto flex items-center px-3 h-12 gap-1">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex items-center justify-center h-8 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${
                active
                  ? 'bg-[#E8002D]/15 text-[#E8002D] border border-[#E8002D]/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
