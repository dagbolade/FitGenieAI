import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;