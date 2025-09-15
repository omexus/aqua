import React from "react";
import { createContext, useEffect, useState } from "react";
import { getCondo, getTenantId } from "../helpers/Api.ts";
import { useAuth } from "../hooks/useAuth";
import { isUsingMockApi } from "../config/environment";

export interface Condo { 
    id: string;
    name: string;
    prefix: string;
}

export const CondoContext = createContext<Condo>({} as Condo);

const CondoProvider = ({ children }: { children: React.ReactNode }) => {
    const [condo, setCondo] = useState<Condo>({ id: "", name: "", prefix: "" });
    const { user } = useAuth();

    useEffect(() => { 
        async function fetchCondo() {
            // Only fetch condo data if user is authenticated
            if (!user) {
                console.log("CondoProvider: No authenticated user, clearing condo data");
                setCondo({ id: "", name: "", prefix: "" });
                return;
            }

            // Get tenant ID from authenticated user
            const tenantId = user.tenantId || getTenantId();
            
            console.log(`CondoProvider: Fetching condo for tenant ${tenantId} (${isUsingMockApi() ? 'MOCK' : 'LIVE'} API)`);
            
            await getCondo(tenantId).then(([success, condo]) => {
                if (success && condo != null) { 
                    console.log("CondoProvider fetchCondo response", condo);
                    setCondo(condo);
                    return;
                }
                console.error("CondoProvider fetchCondo response", condo);
            });
        }

        fetchCondo();
    }, [user]); // Re-fetch when user changes

    return (
        <CondoContext.Provider value={condo}>
            {children}
        </CondoContext.Provider>
    );
};

const useCondo = () => {
    const context = React.useContext(CondoContext);
    if (context === undefined) {
        throw new Error('useCondo must be used within a CondoProvider');
    }
    return context;
};

export default { CondoProvider, useCondo };