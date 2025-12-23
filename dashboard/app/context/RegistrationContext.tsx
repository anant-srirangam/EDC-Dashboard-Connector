'use client';

import { createContext, useContext } from 'react';

type RegistrationContextType = {
    isRegistered: boolean;
    participantId: string | null;
    layoutLoading: boolean;
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider = ({
                                         value,
                                         children,
                                     }: {
    value: RegistrationContextType;
    children: React.ReactNode;
}) => {
    return (
        <RegistrationContext.Provider value={value}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => {
    const ctx = useContext(RegistrationContext);
    if (!ctx) {
        throw new Error('useRegistration must be used inside RegistrationProvider');
    }
    return ctx;
};
