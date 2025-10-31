import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Modern navigation component with glass morphism and responsive design
 * @param {Object} props - Component props
 * @param {Array<string>} props.availableGenerations - List of available generations for selection
 * @param {string} props.selectedGeneration - Currently selected generation
 * @param {Function} props.onGenerationChange - Callback for generation selection changes
 * @param {boolean} props.isMobile - Whether the device is mobile
 */
function Navigation({ availableGenerations, selectedGeneration, onGenerationChange, isMobile = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Enhanced navigation click handler
  const handleNavigationClick = (sectionId, closeMenu = false) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Add visual feedback
      section.classList.add('highlight-section');
      setTimeout(() => section.classList.remove('highlight-section'), 2000);
      
      if (closeMenu) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  // Enhanced state change handler
  const handleGenerationChange = (newGeneration) => {
    onGenerationChange(newGeneration);
    
    // Provide visual feedback
    const stateSelector = document.querySelector('[data-testid="state-selector"]');
    if (stateSelector) {
      stateSelector.classList.add('state-changed');
      setTimeout(() => stateSelector.classList.remove('state-changed'), 500);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 lg:w-7 lg:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-white">Generational Employment</h1>
              <p className="text-xs lg:text-sm text-gray-400">Career Trends Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleNavigationClick('dashboard')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                aria-label="Navigate to Employment Overview section"
              >
                Employment
              </button>
              <button 
                onClick={() => handleNavigationClick('dashboard')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                aria-label="Navigate to Unemployment section"
              >
                Unemployment
              </button>
              <button 
                onClick={() => handleNavigationClick('dashboard')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                aria-label="Navigate to Industry Analysis section"
              >
                Industries
              </button>
              <button 
                onClick={() => handleNavigationClick('insights')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                aria-label="Navigate to Insights section"
              >
                Insights
              </button>
            </div>

            {/* Enhanced Generation Selector */}
            <div className="relative">
              <select
                data-testid="generation-selector"
                value={selectedGeneration}
                onChange={(e) => handleGenerationChange(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white/20 min-w-[160px]"
                aria-label="Select generation for data filtering"
              >
                {availableGenerations.map(generation => (
                  <option key={generation} value={generation} className="bg-gray-800 text-white">
                    {generation}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Tutorial Button */}
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('showTutorial'));
              }}
              className="btn-secondary text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Open tutorial guide"
            >
              Tutorial
            </button>

            {/* CTA Button */}
            <button 
              onClick={() => handleNavigationClick('dashboard')}
              className="btn-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Get started with the dashboard"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/90 backdrop-blur-lg mobile-menu-container">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => handleNavigationClick('dashboard', true)}
                className="block w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Navigate to Employment Overview section"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Employment
                </div>
              </button>
              <button 
                onClick={() => handleNavigationClick('dashboard', true)}
                className="block w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Navigate to Unemployment section"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Unemployment
                </div>
              </button>
              <button 
                onClick={() => handleNavigationClick('dashboard', true)}
                className="block w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Navigate to Industry Analysis section"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Industries
                </div>
              </button>
              <button 
                onClick={() => handleNavigationClick('insights', true)}
                className="block w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Navigate to Insights section"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Insights
                </div>
              </button>
              
              {/* Mobile Generation Selector */}
              <div className="px-3 py-3 border-t border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Generation</label>
                <select
                  value={selectedGeneration}
                  onChange={(e) => handleGenerationChange(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  aria-label="Select generation for data filtering"
                >
                  {availableGenerations.map(generation => (
                    <option key={generation} value={generation} className="bg-gray-800 text-white">
                      {generation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Tutorial Button */}
              <div className="px-3 pt-2">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('showTutorial'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full btn-secondary text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Open tutorial guide"
                >
                  Tutorial
                </button>
              </div>

              {/* Mobile CTA */}
              <div className="px-3 pt-2">
                <button 
                  onClick={() => handleNavigationClick('dashboard', true)}
                  className="w-full btn-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Get started with the dashboard"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

Navigation.propTypes = {
  availableGenerations: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedGeneration: PropTypes.string.isRequired,
  onGenerationChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default Navigation; 