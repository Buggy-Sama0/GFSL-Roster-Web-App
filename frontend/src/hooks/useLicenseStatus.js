// 📁 hooks/useLicenseStatus.js
import { useState, useEffect, useMemo } from 'react';
import supabase from '../services/supabase/client';
const licences = ['cwr_expiry_date', 'green_card_expiry_date', 'spp_expiry_date'];


export function useLicenseStatus() {
    // console.log('useLicenseStatus hook invoked', fetchEmployeeData());
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchEmployeeData() {
            try {
                const { data, error } = await supabase.from('employees').select('*');
                if (error) throw error;
                // console.log('Fetched employees data:', data);
                setData(data);
            } catch (error) {
                console.error('Error fetching employees data:', error);
            }
        }
        fetchEmployeeData();
    }, []);

    // Compute the status for each guard based on their license expiry dates
    const guardStatus = useMemo(() => {
        const today = new Date();
        return data.map((guard) => {
            let absoluteStatus = 'Valid';
            let minDaysLeft = Infinity;
            let expiringLicenses = [];
            let expiredLicenses = [];

            for (const license of licences) {
                if (!guard[license]) {
                    console.log(`Guard: ${guard.name}, License: ${license} is missing.`);
                    continue;
                }
                const expiryDate = new Date(guard[license]);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < minDaysLeft) {
                    minDaysLeft = diffDays;
                }
                if (diffDays <= 60) {
                    expiringLicenses.push(license);
                }
                if (diffDays <= 0) {
                    expiredLicenses.push(license);
                }
            }

            if (minDaysLeft <= 0) {
            absoluteStatus = 'Expired';
            } else if (minDaysLeft <= 60) {
            absoluteStatus = 'Expiring Soon';
            }

            // Return the updated guard profile
            return {
                ...guard,
                status: absoluteStatus,
                daysLeft: minDaysLeft === Infinity ? null : minDaysLeft,
                expiringLicenses: expiringLicenses,
                expiredLicenses: expiredLicenses,
            };
        });
    }, [data]);
    // console.log('Updated Compliance Data with Status:', guardStatus)
    const urgentGuards = useMemo(() => {
        return guardStatus.filter((guard) => guard.status === 'Expiring Soon');
    }, [guardStatus]);
    // console.log('Updated Urgent Data with Status:', typeof urgentGuards);
    const expiredGuards = useMemo(() => {
        // console.log('Updated Expired Data with Status:', guardStatus);
        return guardStatus.filter((guard) => guard.status === 'Expired');
    }, [guardStatus]);
    return { guardStatus, urgentGuards, expiredGuards };
}