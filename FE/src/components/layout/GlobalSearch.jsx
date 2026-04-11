import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            // Navigate to products store with query param
            navigate(`/products?q=${encodeURIComponent(trimmed)}`);
        } else {
            // If empty, just navigate to products
            navigate(`/products`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-surface-container-highest/50 border border-outline-variant/30 rounded-full px-5 py-2.5 gap-3 hover:bg-surface-container-lowest transition-colors focus-within:ring-2 focus-within:ring-primary/30 focus-within:bg-surface-container-lowest">
            <svg className="w-4 h-4 text-on-surface-variant flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
                className="bg-transparent border-none focus:ring-0 text-sm w-56 text-on-surface placeholder:text-on-surface-variant/50 outline-none font-medium"
                placeholder="Tìm kiếm di sản..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="hidden">Submit</button>
        </form>
    );
};

export default GlobalSearch;
