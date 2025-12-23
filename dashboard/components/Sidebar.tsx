'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, PanelLeftClose } from 'lucide-react'; // menu + menu_open equivalent
import { useRegistration} from "@/app/context/RegistrationContext";

export default function Sidebar() {
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(true); // collapse/expand state
    const { isRegistered } = useRegistration();

    // useEffect(() => {
    //     checkRegistrationStatus();
    // }, []);
    //
    // const checkRegistrationStatus = async () => {
    //     try {
    //         const response = await fetch('/api/waltid/status');
    //         const data = await response.json();
    //         setIsRegistered(data.registered);
    //     } catch (error) {
    //         console.error('Failed to check registration status:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // if (loading) {
    //     return (
    //         <div className="w-64 bg-gray-800 text-white h-screen p-4">
    //             <h1 className="text-xl font-bold mb-8">Dashboard Menu</h1>
    //             <div className="text-gray-400">Loading...</div>
    //         </div>
    //     );
    // }

    return (
        <div
            className={`h-full min-h-0 overflow-y-auto bg-gray-800 text-white flex flex-col transition-all duration-300 rounded-2xl
        ${isMenuOpen ? "w-64" : "w-20"}`}
        >
            {/* Header with toggle button */}
            <div className="flex items-center justify-between p-4">
                <h1 className={`font-bold text-lg transition-opacity ${isMenuOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                    Menu
                </h1>
                <button
                    className="btn btn-sm btn-ghost text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <PanelLeftClose className="w-6 h-6" /> // menu_open
                    ) : (
                        <Menu className="w-6 h-6" /> // menu
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
                <ul className="menu bg-gray-800 text-white px-2">
                    {!isRegistered ? (
                        <li>
                            <Link href="/register" className="p-2 rounded hover:bg-gray-700">
                                {isMenuOpen && <span>Register</span>}
                            </Link>
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link href="/" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">home</span>
                                    {isMenuOpen && <span>Home</span>}
                                </Link>
                            </li>

                            <li>
                                <div className="w-full mx-auto px-1 h-px bg-gray-300/15 my-2"></div>
                            </li>

                            <li>
                                <Link href="/register" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">id_card</span>
                                    {isMenuOpen && <span>Register Credentials</span>}
                                </Link>
                            </li>

                            <li>
                                <div className="w-full mx-auto px-1 h-px bg-gray-300/15 my-2"></div>
                            </li>

                            <li>
                                <Link href="/assets" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">deployed_code_update</span>
                                    {isMenuOpen && <span>Assets</span>}
                                </Link>
                            </li>

                            <li>
                                <Link href="/policies" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">policy</span>
                                    {isMenuOpen && <span>Policies</span>}
                                </Link>
                            </li>

                            <li>
                                <Link href="/contract-definitions" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">contract_edit</span>
                                    {isMenuOpen && <span>Contract Definitions</span>}
                                </Link>
                            </li>

                            <li>
                                <Link href="/catalog" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">book_ribbon</span>
                                    {isMenuOpen && <span>Catalog</span>}
                                </Link>
                            </li>

                            <li>
                                <div className="w-full mx-auto px-1 h-px bg-gray-300/15 my-2"></div>
                            </li>

                            <li>
                                <Link href="/negotiations" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">contract</span>
                                    {isMenuOpen && <span>Negotiations</span>}
                                </Link>
                            </li>

                            <li>
                                <Link href="/contracts" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">handshake</span>
                                    {isMenuOpen && <span>Contracts</span>}
                                </Link>
                            </li>

                            <li>
                                <Link href="#" className="flex items-center gap-x-2 p-2 rounded hover:bg-gray-700">
                                    <span className="material-symbols-rounded text-[1.75rem]">schedule_send</span>
                                    {isMenuOpen && <span>Transfer History</span>}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
}
