import React from 'react';
import { themes } from '../constants';
import { SunIcon, MoonIcon } from './Icons';


interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <header className="bg-base-200 shadow-md">
      <div className="navbar container mx-auto px-4">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl font-bold">Mswasth Data Entry Portal</a>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              Theme
              <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto">
              {themes.map(theme => (
                <li key={theme}>
                  <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                    aria-label={theme.charAt(0).toUpperCase() + theme.slice(1)}
                    value={theme}
                    checked={currentTheme === theme}
                    onChange={(e) => onThemeChange(e.target.value)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;