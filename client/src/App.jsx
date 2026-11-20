import { useState } from "react";
import Navbar from "./components/Navbar";
import MoviesPage from "./pages/MoviePage";
import RewatchPlanPage from "./pages/RewatchPlanPage";
import BookingPage from "./pages/BookingPage";
import CreateCinemaPage from "./pages/CreateCinemaPage";
import { ToastProvider } from "./components/ToastProvider";

function App() {
  const [activeView, setActiveView] = useState("movies");

  return (
    <ToastProvider>
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main className="app-container">
        {activeView === "movies" && <MoviesPage />}
        {activeView === "rewatch" && <RewatchPlanPage />}
        {activeView === "booking" && (
          <BookingPage onViewChange={setActiveView} />
        )}
        {activeView === "createCinema" && (
          <CreateCinemaPage onViewChange={setActiveView} />
        )}
      </main>
    </ToastProvider>
  );
}

export default App;
