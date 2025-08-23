import React from "react";
import { createContext, useEffect, useState } from "react";
import { getCondo } from "../helpers/Api.ts";

export interface Condo { 
    id: string;
    name: string;
    attribute: string;
    prefix: string;
}

// export const CondoContext = createContext<Condo>({
//     id: "",
//     name: "",
//     attributes: "",
//     prefix: ""
// });

export const CondoContext = createContext<Condo>({} as Condo);

const CondoProvider = ({ children }: { children: React.ReactNode }) => {
    const [condo, setCondo] = useState<Condo>({ id: "", name: "", attribute: "", prefix: "" });

  useEffect(() => { 
    async function fetchCondo() { 
      await getCondo("a2f02fa1-bbe4-46f8-90be-4aa43162400c").then(([sucess, condo]) => {
        if (sucess && condo != null) { 
          console.log("CondoProvider fetchCondo response", condo);
          setCondo(condo);
          return;
        }
        console.error("CondoProvider fetchCondo response", condo);
      });
    }

    fetchCondo();

        // console.log("CondoProvider mounted");
        // setCondo({ id: "1", name: "Condo 2", attributes: "attributes", prefix: "prefix" });
        // return () => {
        //     console.log("CondoProvider unmounted");
        // };
      
    },[]);

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
  }

export default {CondoProvider, useCondo};