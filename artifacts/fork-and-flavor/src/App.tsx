import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Analytics } from '@vercel/analytics/react';

// Components
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Pages
import Home from '@/pages/Home';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/recipe/:slug" component={RecipeDetail} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
