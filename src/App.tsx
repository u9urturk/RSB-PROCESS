import { useRoutes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import routes from "./routes";
import { NavigationProvider } from "./context/provider/NavigationProvider";
import PageTransition from "./components/PageTransition";
import { useEffect } from "react";
import { fetchCsrfToken } from "./api/csrfService";

function App() {
  const location = useLocation();
  const showRoutes = useRoutes(routes);
  useEffect(() => {
    const fetchCsrf = async () => {
      const csrfToken = await fetchCsrfToken().catch(() => { });
      console.log(csrfToken);

    };
    fetchCsrf();
  }, []);

  return (
    <NavigationProvider>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          {showRoutes}
        </PageTransition>
      </AnimatePresence>
    </NavigationProvider>
  );
}

export default App;
