import React from 'react';
import { Outlet } from 'react-router-dom'; 

const Layout = () => {
    return (
        <>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-surface glass-header border-b border-outline-variant/10">
                <div className="flex justify-between items-center px-6 md:px-8 py-4 w-full max-w-7xl mx-auto">
                    <a className="text-2xl font-bold tracking-tighter text-primary font-headline" href="/">
                        Atelier
                    </a>
                    <div className="hidden md:flex items-center gap-8">
                        <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-label">
                            Eco-Conscious Luxury
                        </span>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <Outlet />
            
            {/* Footer */}
            <footer className="w-full mt-auto bg-surface-container-low border-t border-outline-variant/10">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-8 w-full max-w-7xl mx-auto gap-4">
                    <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/70">
                        © 2024 Atelier Digital. Conscious Luxury.
                    </span>
                    <div className="flex gap-8">
                        <a className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/70 hover:text-primary transition-colors" href="#">
                            Privacy Policy
                        </a>
                        <a className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/70 hover:text-primary transition-colors" href="#">
                            Sustainability
                        </a>
                    </div>
                </div>
            </footer>
       
        </>
    )
}
export default Layout;  