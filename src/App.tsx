import { useRoutes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import routes from "./routes";
import { NavigationProvider } from "./context/provider/NavigationProvider";
import { WebSocketProvider } from "./context/provider/WebSocketProvider";
import { NotificationProvider } from "./context/provider/NotificationProvider";
import PageTransition from "./components/PageTransition";


function App() {
  const location = useLocation();
  const showRoutes = useRoutes(routes);

  return (
    <NavigationProvider>
      <NotificationProvider>
        <WebSocketProvider>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {showRoutes}
            </PageTransition>
          </AnimatePresence>
        </WebSocketProvider>
      </NotificationProvider>
    </NavigationProvider>
  );
}

export default App;
