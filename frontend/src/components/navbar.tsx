"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const handleNavClick = (sectionId: string) => {
    setOpen(false);
    if (pathname === "/") onNavigate?.(sectionId);
    else router.push(`/#${sectionId}`);
  };

  // lock scroll
  useEffect(() => {
    const b = document.body;
    if (open) {
      const prev = b.style.overflow;
      b.style.overflow = "hidden";
      return () => {
        b.style.overflow = prev;
      };
    }
  }, [open]);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // close clicking outside panel
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full border-b transition-colors ${
        open ? "bg-white border-orange-100" : "bg-white/85 backdrop-blur-md border-gray-200"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        {/* Hamburguesa IZQUIERDA (solo mobile/tablet) */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-controls="mobile-menu"
          aria-expanded={open}
          className="md:hidden flex items-center justify-center rounded-md p-2 text-orange-600 hover:bg-orange-50"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 flex items-center justify-center bg-orange-500 rounded-lg shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-orange-600 tracking-tight">RentMatch</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/", label: "Inicio" },
            { label: "¿Cómo funciona?", onClick: () => handleNavClick("como-funciona") },
            { href: "/landing/inquilino", label: "Inquilinos" },
            { href: "/landing/propietario", label: "Propietarios" },
            { href: "/landing/contacto", label: "Contacto" },
            { href: "/landing/nosotros", label: "Nosotros" },
          ].map(({ href, label, onClick }) =>
            href ? (
              <Link
                key={label}
                href={href}
                className="relative font-medium text-gray-700 hover:text-orange-600 transition-colors group"
              >
                {label}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-orange-500 transition-all group-hover:w-full" />
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClick}
                className="relative font-medium text-gray-700 hover:text-orange-600 transition-colors group"
              >
                {label}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-orange-500 transition-all group-hover:w-full" />
              </button>
            )
          )}
        </nav>

        {/* Auth desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-gray-800 hover:text-orange-700">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md">Registrarse</Button>
          </Link>
        </div>
      </div>

      {/* ====== MOBILE/TABLET MENU (fondo blanco sólido) ====== */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay BLANCO SÓLIDO */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduce ? { duration: 0 } : { duration: 0.15 }}
              className="fixed inset-0 z-40 bg-white md:hidden"
            />

            {/* Sheet desde la IZQUIERDA */}
            <motion.div
              key="panel"
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }
              }
              className="fixed left-0 top-0 z-[60] h-dvh w-[88%] max-w-sm overflow-y-auto rounded-r-3xl bg-white shadow-2xl ring-1 ring-orange-100 md:hidden"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {/* header del sheet */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
                <span className="text-lg font-bold text-orange-600">Menú</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-orange-50 text-orange-600"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* links */}
              <nav className="flex flex-col gap-1 p-3">
                <MobileItem href="/" label="Inicio" onClick={() => setOpen(false)} />
                <MobileButton label="¿Cómo funciona?" onClick={() => handleNavClick("como-funciona")} />
                <MobileItem href="/landing/inquilino" label="Para inquilinos" onClick={() => setOpen(false)} />
                <MobileItem href="/landing/propietario" label="Para propietarios" onClick={() => setOpen(false)} />
                <MobileItem href="/landing/contacto" label="Contacto" onClick={() => setOpen(false)} />
                <MobileItem href="/landing/nosotros" label="Nosotros" onClick={() => setOpen(false)} />
              </nav>

              <div className="mx-3 my-2 border-t border-orange-100" />

              <div className="flex flex-col gap-2 p-3">
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-between text-gray-800 hover:text-orange-700 hover:bg-orange-50">
                    Iniciar sesión <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>

              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ===== Auxiliares ===== */
function MobileItem({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl px-3 py-3 text-base text-gray-800 hover:text-orange-700 hover:bg-orange-50 transition"
    >
      <span>{label}</span>
      <ChevronRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function MobileButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-base text-gray-800 hover:text-orange-700 hover:bg-orange-50 transition"
    >
      <span>{label}</span>
      <ChevronRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
