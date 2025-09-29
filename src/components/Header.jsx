import React, { useState } from "react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="w-full bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Header Container */}
                <div className="flex items-center justify-between h-16 lg:h-20">
                    
                    {/* Brand Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <a 
                            href="#" 
                            className="flex items-center space-x-3 group"
                            onClick={closeMobileMenu}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Interview AI
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Powered by AI
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        <a
                            href="#"
                            className="px-4 lg:px-5 py-2.5 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative group"
                        >
                            <span className="relative z-10">Home</span>
                            <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                        </a>
                        <a
                            href="#"
                            className="px-4 lg:px-5 py-2.5 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative group"
                        >
                            <span className="relative z-10">Features</span>
                            <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                        </a>
                        <a
                            href="#"
                            className="px-4 lg:px-5 py-2.5 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative group"
                        >
                            <span className="relative z-10">About</span>
                            <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                        </a>
                        <a
                            href="#"
                            className="px-4 lg:px-5 py-2.5 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative group"
                        >
                            <span className="relative z-10">Contact</span>
                            <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                        </a>
                        <div className="ml-4 lg:ml-6 flex items-center space-x-3">
                            <button className="px-4 lg:px-6 py-2.5 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                                Sign In
                            </button>
                            <button className="px-6 lg:px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm lg:text-base font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105">
                                Get Started
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                    <div className="px-2 pt-2 pb-4 space-y-1 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all duration-200"
                            onClick={closeMobileMenu}
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all duration-200"
                            onClick={closeMobileMenu}
                        >
                            Features
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all duration-200"
                            onClick={closeMobileMenu}
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all duration-200"
                            onClick={closeMobileMenu}
                        >
                            Contact
                        </a>
                        <div className="pt-4 space-y-2">
                            <button 
                                className="w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all duration-200"
                                onClick={closeMobileMenu}
                            >
                                Sign In
                            </button>
                            <button 
                                className="w-full px-4 py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={closeMobileMenu}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

