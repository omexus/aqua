import "./App.css";
import Statements from "./pages/Statements.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import Billing from "./pages/Billing";
import Periods from "./pages/Periods.tsx";
import Context from "./contexts/CondoContext.tsx";
import "@mantine/dates/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ApiTest } from "./components/auth/ApiTest";
import ManagerDashboardWrapper from "./components/manager/ManagerDashboardWrapper.tsx";

function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <AuthProvider>
          <Context.CondoProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />}>
                  <Route path="statements" element={<Periods />}></Route>
                  <Route path="statements/:id" element={<Statements />}></Route>
                  <Route path="billing" element={<Billing />}></Route>
                </Route>
                <Route path="/manager-dashboard" element={<ManagerDashboardWrapper />}></Route>
                <Route path="/manager-dashboard/statements" element={<ManagerDashboardWrapper />}></Route>
                <Route path="/manager-dashboard/login" element={<ManagerDashboardWrapper />}></Route>
                <Route path="/api-test" element={<ApiTest />}></Route>
                <Route path="*" element={<NotFound />}></Route>
              </Routes>
            </BrowserRouter>
          </Context.CondoProvider>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
