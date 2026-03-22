import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

export const useAnalytics = (pageType, productId = null) => {
    const location = useLocation();

    useEffect(() => {
        // Simple visitor ID in localStorage
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem('visitor_id', visitorId);
        }

        const track = async () => {
            const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct';
            
            await dashboardService.trackVisit({
                pageType,
                productId,
                visitorId,
                referrer
            });
        };

        track();
    }, [location.pathname, pageType, productId]);
};
