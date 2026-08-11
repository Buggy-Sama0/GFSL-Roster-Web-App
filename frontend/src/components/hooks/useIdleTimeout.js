import { useEffect, useRef, useState } from 'react';
import supabase from '../../services/supabase/client';

export function useIdleTimeout(timeoutDuration = 30) { // default to 30 minute
    const timeRef = useRef(null);

    const handleLogout = async () => {
        try {
            console.warn('User has been idle for too long. Logging out...');
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    const resetTimer = () => {
        if (timeRef.current) {
            clearTimeout(timeRef.current);
        }
        timeRef.current = setTimeout(handleLogout, timeoutDuration*60*1000); // Convert minutes to milliseconds
    }

    useEffect(() => {
        // Human interaction events to monitor
        const activityEvents = [
        'mousemove',
        'keydown',
        'click',
        'scroll',
        'touchstart',
        ];

        resetTimer(); // Start the timer when the component mounts

        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeRef.current) {
                clearTimeout(timeRef.current);
            }
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        }
    }, [timeoutDuration]);
}