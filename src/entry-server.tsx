import { renderToStaticMarkup } from "react-dom/server"

import App from "./App"
import { M3eProvider } from "@/components/m3e/m3e-provider"
import { M3E_THEME } from "@/lib/theme"

/**
 * Entry point for the markup checks (`npm run check:markup`): renders the whole
 * page to HTML in Node, so the assertions run against the real component tree —
 * the same elements, class names, ARIA attributes and Arabic strings a visitor
 * gets — instead of against the source.
 *
 * It is not used by the deployed site (that builds src/main.tsx).
 */
export function render(): string {
  return renderToStaticMarkup(
    <M3eProvider
      colorMode={{ defaultMode: "dark", toggleKey: false }}
      theme={{ defaultTheme: M3E_THEME, persist: false }}
    >
      <App />
    </M3eProvider>
  )
}
