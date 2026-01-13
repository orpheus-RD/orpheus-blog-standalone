import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Photography from "./pages/Photography";
import Magazine from "./pages/Magazine";
import Academic from "./pages/Academic";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import Layout from "./components/Layout";

function Router() {
  return (
    <Switch>
      {/* Admin routes - without Layout */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/:rest*" component={Admin} />
      
      {/* Public routes - with Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/photography" component={Photography} />
            <Route path="/magazine" component={Magazine} />
            <Route path="/academic" component={Academic} />
            <Route path="/search" component={Search} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
