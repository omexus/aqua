import React from "react";
import { createContext, useEffect, useState } from "react";
import { getCondo, getTenantId } from "../helpers/Api.ts";
import { useAuth } from "../hooks/useAuth";

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
            // Get tenant ID from authenticated user or default
            const tenantId = user?.tenantId || getTenantId();
            
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