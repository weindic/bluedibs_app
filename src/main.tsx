import { MantineProvider, createEmotionCache } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store/store";
import { queryClient } from "./utils/queryClient";
import { GlobalStateProvider } from './realtime/GlobalStateContext'; // Import the GlobalStateProvider here
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <MantineProvider
      withCSSVariables
      withGlobalStyles
      withNormalizeCSS
      emotionCache={createEmotionCache({
        key: "mantine",
        prepend: false,
      })}
      theme={{
        defaultRadius: "md",
        primaryColor: "indigo",
        fontFamily: `"Poppins", sans-serif`,
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}

        <Provider store={store}>
          <GlobalStateProvider> {/* Add the GlobalStateProvider here */}
            <App />
          </GlobalStateProvider>
        </Provider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
);