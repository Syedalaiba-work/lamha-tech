import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";

/**
 * Marketing-site chrome: header, footer and the motion layer. Not used by the owner portal.
 * Footer reveal: on wide, tall screens the footer is pinned beneath the page (sticky, lower layer) and the
 * page lifts off it at the end; elsewhere (phones, short windows) it is ordinary flow.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <Header />
      <main id="main" className="relative z-10 flex-1 bg-paper shadow-[0_48px_80px_-40px_rgba(7,19,43,0.45)]">
        {children}
      </main>
      <Footer />
    </MotionProvider>
  );
}
