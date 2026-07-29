import {createContext, useState} from 'react';

export const SiteContext = createContext();

export function SiteProvider({children}) {
    const [currentSite, setCurrentSite] = useState('');
    return (
        <SiteContext.Provider value={{currentSite, setCurrentSite}}>
            {children}
        </SiteContext.Provider>
    );
}

