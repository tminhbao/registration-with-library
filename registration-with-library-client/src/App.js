import React, { useState } from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import MainNavigation from "./components/layout/MainNavigation";
import CourseListPage from "./pages/CourseListPage";
import CourseHistoryPage from "./pages/CourseHistoryPage";
import CourseCreatePage from "./pages/CourseCreatePage";
import "@progress/kendo-theme-default/dist/all.css";
import "./App.css";
import Account from "./components/Account/account";

//import FormSignUpToLoginPage from "./pages/FormSignUpToLoginPage";
//import FormLoginPage from "./pages/FormLoginPage";
import FormUserEditPage from "./pages/FormUserEditPage";

import CourseDetailPage from "./pages/CourseDetailPage";

import HomePage from "./pages/HomePage";
import FormSignUpHook from "./components/FormSignUpHook/FormSignUpHook";
import FormLoginHook from "./components/FormLoginHook/FormLoginHook";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDocSq9D1139yFAGbA-nhEAAbVW96E_t4",
  authDomain: "registration-with-lib.firebaseapp.com",
  projectId: "registration-with-lib",
  storageBucket: "registration-with-lib.appspot.com",
  messagingSenderId: "627735285647",
  appId: "1:627735285647:web:52f37b82b0359980c605fa",
  measurementId: "G-5W9M038BTV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  return (
    <HashRouter>
      <div>
        <MainNavigation />
        <div className="ml-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course-list" element={<CourseListPage />} />
            <Route path="/course-history" element={<CourseHistoryPage />} />
            <Route path="/course-create" element={<CourseCreatePage />} />

            {/*phuc*/}
            <Route path="/form-signuptologin" element={<FormSignUpHook />} />
            <Route path="/form-login" element={<FormLoginHook />} />
            <Route path="/form-edit" element={<FormUserEditPage />} />

            {/* Bảo thêm dô đoạn này  */}
            <Route path="/my-account" element={<Account />} />
            <Route path="/course/:courseID" element={<CourseDetailPage />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
