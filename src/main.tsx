import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import { M3eProvider } from "@/components/m3e/m3e-provider"
import { Toaster } from "@/components/m3e/toast"
import { M3E_THEME } from "@/lib/theme"

/*
 * M3eProvider is two providers in one: ColorModeProvider (light / dark) and
 * M3ThemeProvider (the M3 color scheme, motion scheme and shape scale).
 *
 *  - the scheme is the brand scheme, `variant: "sharea"`, generated from the
 *    navy seed with material-color-utilities (docs/color-mapping.md)
 *  - the page is dark-only by design; `index.html` sets the `.dark` class and
 *    the storage key before the first paint, so nothing flashes
 *  - `persist: false` keeps the scheme fixed: this page has no theme picker
 *  - `toggleKey: false` removes M3E's "press D to switch light/dark" shortcut
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <M3eProvider
      colorMode={{ defaultMode: "dark", toggleKey: false }}
      theme={{ defaultTheme: M3E_THEME, persist: false }}
    >
      <Toaster />
      <App />
    </M3eProvider>
  </StrictMode>
)
