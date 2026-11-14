import React from 'react';
import { BookOpen } from 'lucide-react';
import type { AppView, UserProfile } from '../types';
import { Avatar } from './Avatar';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  profile: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  profile,
}) => {
  const navItems: { view: AppView; label: string }[] = [
    { view: 'home', label: 'Home' },
    { view: 'study', label: 'Study Space' },
    { view: 'buddies', label: 'Find Buddies' },
    { view: 'room', label: 'Study Room' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E4F2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex shrink-0 items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3] rounded-lg"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#634EE3] text-white">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-[#1E1B2E] whitespace-nowrap shrink-0">
            Study<span className="text-[#634EE3]">Buddy</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5A5670]"
        >
          {navItems.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3] ${
                  active
                    ? 'border-[#634EE3] text-[#1E1B2E] font-semibold'
                    : 'border-transparent hover:text-[#1E1B2E] hover:border-[#D4CEF2]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex shrink-0 items-center gap-3">
          {profile ? (
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2.5 rounded-lg border border-[#E4E0F3] bg-[#F8F7FC] px-3 py-1.5 text-sm font-semibold text-[#1E1B2E] transition-colors hover:border-[#634EE3]/50 hover:bg-[#F1EFFB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3]"
            >
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size="sm"
                className="!h-6 !w-6 !text-[11px]"
              />
              <span className="max-w-[120px] truncate">{profile.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="rounded-lg bg-[#634EE3] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#523DD4] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3] focus-visible:ring-offset-2"
            >
              Set Up Profile
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile nav strip */}
      <div className="flex md:hidden items-center justify-around border-t border-[#EEEBF6] bg-white px-2 py-1.5 text-xs font-medium text-[#5A5670]">
        {navItems.map((item) => {
          const active = currentView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={`rounded-md px-2.5 py-1.5 whitespace-nowrap transition-colors ${
                active ? 'bg-[#F1EFFB] text-[#634EE3] font-semibold' : ''
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
