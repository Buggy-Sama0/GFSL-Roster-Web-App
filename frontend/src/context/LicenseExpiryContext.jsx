import {createContext, useState} from 'react';

export const LicenseExpiryContext = createContext();

export function LicenseExpiryProvider({children}) {
    const [currentLicenseExpiry, setCurrentLicenseExpiry] = useState({});
    return (
        <LicenseExpiryContext.Provider value={{currentLicenseExpiry, setCurrentLicenseExpiry}}>
            {children}
        </LicenseExpiryContext.Provider>
    );
}

