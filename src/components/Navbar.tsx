import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ERP_AUTH_URL } from "@/lib/api";

type NavItem = { label: string; to: string; children?: { label: string; to: string }[] };

export const navigation: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About",
    to: "/about",
    children: [
      { label: "About SVRST", to: "/about/svrst-trust" },
      { label: "Our Mission", to: "/about/mission" },
      { label: "Our Journey", to: "/about/journey" },
      { label: "Our Achievements", to: "/about/achievements" },
    ],
  },
  {
    label: "Education",
    to: "/education",
    children: [
      { label: "Education", to: "/education" },
      { label: "Dhyana & Yoga", to: "/dhyana-yoga" },
      { label: "Sports", to: "/sports" },
    ],
  },
  {
    label: "Get Involved",
    to: "/volunteer-registration",
    children: [
      { label: "Volunteer Registration", to: "/volunteer-registration" },
      { label: "Request Help", to: "/request-help" },
      { label: "Corporate Partnership", to: "/corporate-partnership" },
    ],
  },
  {
    label: "Events",
    to: "/events",
    children: [
      { label: "Upcoming Events", to: "/events/upcoming" },
      { label: "Past Events", to: "/events/past" },
      { label: "Gallery", to: "/events/gallery" },
    ],
  },
  { label: "Contact", to: "/contact" },
  { label: "Donation", to: "/donate" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  const solid = scrolled || !overHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "border-b border-border/70 bg-background/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="SVRST home">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-foreground/95 shadow-soft ring-1 ring-black/5">
            <img
              src="/assets/images/svrst-logo.png"
              alt="SVRST"
              width="48"
              height="48"
              className="size-full object-cover"
            />
          </span>
          <span className="leading-tight">
            <span
              className={cn(
                "block font-display text-lg font-semibold tracking-tight transition-colors",
                solid ? "text-foreground" : "text-primary-foreground",
              )}
            >
              SVRST
            </span>
            <span
              className={cn(
                "block text-[0.65rem] font-semibold uppercase tracking-[0.18em] transition-colors",
                solid ? "text-accent" : "text-primary-foreground/70",
              )}
            >
              Mathrudhama Children's Home
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <div key={item.to} className="group relative">
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    item.label === "Donation"
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : solid
                        ? active
                          ? "text-accent"
                          : "text-foreground/80 hover:text-accent"
                        : active
                          ? "text-saffron"
                          : "text-primary-foreground/85 hover:text-primary-foreground",
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                  )}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-0 top-full w-60 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-lift">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="block rounded-xl px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-secondary hover:text-accent"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant={solid ? "outline" : "hero"}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a href={ERP_AUTH_URL}>Login</a>
          </Button>
          <Button
            variant={solid ? "ghost" : "hero"}
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-border bg-background/98 backdrop-blur-xl transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[80dvh] overflow-y-auto border-t opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.to} className="border-b border-border/60 pb-1 last:border-0">
                <div className="flex items-center justify-between">
                  <Link
                    to={item.to}
                    className="block flex-1 py-3 text-base font-medium text-foreground"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} links`}
                      aria-expanded={expanded === item.label}
                      onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                      className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-accent"
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          expanded === item.label && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>
                {item.children && (
                  <ul
                    className={cn(
                      "overflow-hidden pl-3 transition-[max-height] duration-400",
                      expanded === item.label ? "max-h-80" : "max-h-0",
                    )}
                  >
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <Link
                          to={child.to}
                          className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-accent"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="border-b border-border/60 pb-1 sm:hidden">
              <a
                href={ERP_AUTH_URL}
                className="block py-3 text-base font-medium text-foreground"
              >
                Login
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
