import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Schema factories take the namespace translator and bake its output into the
// Zod messages. Returning the key itself lets a test assert which message the
// schema chose, not just that it rejected.
export const tStub = (key) => key;

export const queryWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};
