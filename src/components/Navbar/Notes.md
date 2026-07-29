# NavbarAuth.tsx

  1. Mobile drawer is now fully enabled — The previously commented-out drawer is live, using a CSS max-h + opacity transition for a smooth slide-down animation. No JavaScript height calculations needed.

  2. Outside-click closes the dropdown — Added a useRef + useEffect listener so clicking anywhere outside the user menu closes it, which is essential UX for mobile.

  3. Drawer closes on window resize — Prevents the drawer from staying open when a user rotates their phone or resizes to desktop.

  4. User avatar initials now styled — The initials circle uses a sky-blue tinted background matching the brand accent, consistent with the pill in the logo.

  5. Dropdown menu items have icons — Each item (Account, Reports, Settings, Log out) has a lucide icon for faster visual scanning.

  6. Dropdown header shows full user info — A larger avatar + username + email at the top of the dropdown, making it feel like a proper user card rather than a tiny label.

  7. Chevron animates on open/close — The ChevronDown rotates 180° when the menu is open.

  8. Consistent 14px navbar height — Added h-14 to the inner bar so the height is locked regardless of content.

# Navbar.tsx

  1. Brand mark gets a sky dot accent — A small sky-500 circle before the logo text, matching the .ai suffix color, giving it a small but memorable identity mark.

  2. Consistent h-14 height — Matches NavbarAuth so the page doesn't jump when switching between authenticated and unauthenticated views.

  3. Login uses a hover background — Now has hover:bg-[hsl(var(--muted))] instead of just a color change, making it feel more button-like on mobile tap targets.