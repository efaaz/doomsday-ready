const navigationItems = [
  { id: "movies", label: "Movies" },
  { id: "rewatch", label: "Rewatch Plan" },
  { id: "booking", label: "Booking" },
];

function Navbar({ activeView, onViewChange }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a
          href="#home"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            onViewChange("movies");
          }}
          aria-label="Doomsday Ready home"
        >
          <div className="brand-mark">DR</div>

          <div className="brand-text">
            <span className="brand-name">Doomsday Ready</span>
            <span className="brand-caption">THE MCU WATCH PLANNER</span>
          </div>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => onViewChange(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
