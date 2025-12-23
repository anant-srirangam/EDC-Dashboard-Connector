'use client';

import Sidebar from '@/components/Sidebar';
import HealthRibbon from '@/components/HealthRibbon'
import '../app/globals.css';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RegistrationProvider } from '@/app/context/RegistrationContext';
import Head from "next/head";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isRegistered, setIsRegistered] = useState(false);
    const [participantId, setParticipant] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                const response = await fetch('/api/registration/status');
                const data = await response.json();
                setIsRegistered(true);
                setParticipant(data.participant);
            } catch (error) {
                console.error('Failed to check registration status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkRegistrationStatus();
    }, []);

    // Redirect if not registered
    // useEffect(() => {
    //     if (!loading && !isRegistered && pathname !== '/register') {
    //         window.location.href = '/register';
    //     }
    // }, [loading, isRegistered, pathname]);

    return !loading && (
        <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4 bg-gray-100 h-full">
            <RegistrationProvider
                value={{ isRegistered, participantId, layoutLoading: loading }}
            >
                {/* Top health ribbon */}
                <HealthRibbon />
                {/* Main area with sidebar + content */}
                <div className="flex flex-1 overflow-hidden rounded-2xl gap-x-4 ">
                    <Sidebar />

                    <main className="flex-1 p-2 bg-gray-200 overflow-y-auto rounded-2xl">

                            {children}

                    </main>
                </div>
            </RegistrationProvider>
        </div>
    );

}
