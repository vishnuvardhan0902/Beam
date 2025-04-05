import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-900 py-4">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-white font-bold text-2xl">Beam</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#testimonials">Testimonials</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white hover:text-blue-200 transition-colors duration-300">Login</button>
            <button className="bg-white text-indigo-900 hover:bg-blue-100 py-2 px-4 rounded-lg transition-colors duration-300">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-4 py-4">
              <NavLink href="#features" mobile>Features</NavLink>
              <NavLink href="#testimonials" mobile>Testimonials</NavLink>
              <NavLink href="#pricing" mobile>Pricing</NavLink>
              <NavLink href="#contact" mobile>Contact</NavLink>
              <div className="pt-4 border-t border-blue-800">
                <button className="w-full text-center py-3 mb-2 text-white hover:text-blue-200 transition-colors duration-300">Login</button>
                <button className="w-full text-center py-3 bg-white text-indigo-900 hover:bg-blue-100 rounded-lg transition-colors duration-300">Sign Up</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, mobile }) => {
  return (
    <a 
      href={href} 
      className={`text-white hover:text-blue-200 transition-colors duration-300 ${mobile ? 'block' : ''}`}
    >
      {children}
    </a>
  );
};

export default Navbar; 