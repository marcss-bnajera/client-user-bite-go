import { useState } from "react";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export const UserLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <Header
                mobileMenuOpen={mobileMenuOpen}
                onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
            />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    );
};
