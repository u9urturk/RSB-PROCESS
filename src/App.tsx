import { useRoutes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import routes from "./routes";
import { NavigationProvider } from "./context/provider/NavigationProvider";
import PageTransition from "./components/PageTransition";


function App() {
  const location = useLocation();
  const showRoutes = useRoutes(routes);


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
