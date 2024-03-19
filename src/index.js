import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Pages/Layout";
import ErrorPage from "./Pages/ErrorPage";
import MainPage from "./Pages/MainPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [

      {
        path: "/",
        element: <MainPage />,
      }
    
    ],
  },
]);

//USERCONTEXTES CUCC
export const UserContext = React.createContext();

//szerver cím
//const urlString="https://localhost:44382"
//const urlString="https://vms-server-y7pt.onrender.com";
//export default urlString;

const App = () => {
  
  /*const [user, setUser] = React.useState(null);
  const [page, setPage] = React.useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };
  */
  
  return (
    <UserContext.Provider value={{}}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </UserContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
