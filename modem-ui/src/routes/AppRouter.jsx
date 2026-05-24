import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import SMS from "../pages/SMS";
import SMSCompose from "../pages/SMSCompose";
import Contacts from "../pages/Contacts";
import USSD from "../pages/USSD";
import Internet from "../pages/Internet";
import Settings from "../pages/Settings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>

          <Route path="/" element={<Dashboard />} />

          {/* SMS SYSTEM */}
          <Route path="/sms" element={<SMS />} />
          <Route path="/sms/send" element={<SMSCompose />} />
          <Route path="/contacts" element={<Contacts />} />

          <Route path="/ussd" element={<USSD />} />
          <Route path="/internet" element={<Internet />} />
          <Route path="/settings" element={<Settings />} />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}