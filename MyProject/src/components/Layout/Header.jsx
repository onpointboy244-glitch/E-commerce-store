import "../../styles/Header.css";
import { Link } from "react-router-dom";
import { CartIcon } from "./CartIcon";
import { Notifications } from "./Notifications";
import { SearchBar } from "./SearchBar";
import { Profile } from "./Profile";
export function Header({ onSearchSelect, cartCount }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-2">
      <div className="container-fluid d-flex align-items-center">
        <Link className="navbar-brand p-0" to="/">
          <img
            className="headerimg"
            src="images/kitchen.png"
            alt="kitchen"
            style={{ width: "55px", filter: "invert(100%)" }}
          />
        </Link>

        {/* عرض المكونات التي يتم تمريرها من الخارج */}
        <SearchBar onSearchSelect={onSearchSelect} />
        <Notifications />
        <div className="all d-flex align-items-center gap-3">
          <div className="returns-container d-none d-md-flex">
            <Link className="return" to="/orders">
              MyOrders
            </Link>
            <Link to="/orders" className="order fw-bold">
              &Tracking
            </Link>
          </div>

          <CartIcon cartCount={cartCount} />
          <Profile />
        </div>
      </div>
    </nav>
  );
}
