import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-600 bg-slate-800">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="text-sm tracking-normal text-white font-base">Powered by</div>
          <a
            href="https://botivate.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center text-lg font-semibold tracking-wide text-white transition-all duration-300 group hover:scale-105"
          >
            <span className="text-transparent transition-all duration-300 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text group-hover:from-blue-300 group-hover:via-purple-400 group-hover:to-blue-500">
              Botivate
            </span>
            <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out group-hover:w-full"></div>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
