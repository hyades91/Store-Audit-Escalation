import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../..";

import "./Layout.css";

const Layout = () => {
  
//const [user, setUser] = useState(useContext(UserContext));
const context= useContext(UserContext);
const {user}= useContext(UserContext);
const navigate =useNavigate()
// Logout updates the user data to default
const logout = (e) => {
  e.preventDefault();
  context.setUser(null);
  navigate("/")
};


  return(
  <div className="Layout">
    <nav>
      <ul>
      <div className="MarketPlace">
        <li>
          <Link to="/">Store Audit Escalation</Link>
        </li>
        </div>
      </ul>
    </nav>
    <div className="Outlet">
      <Outlet />
    </div>

  </div>
);
}

export default Layout;
