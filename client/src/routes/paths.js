export const APP_PATHS = {
  home: "/",
  umrah: "/umrah",
  calculator: "/umrah/package-calculator",
  hajj: "/hajj",
  tours: "/tours",
  flights: "/flights",
  visa: "/visa",
};

const PAGE_BY_PATH = Object.fromEntries(
  Object.entries(APP_PATHS).map(([page, path]) => [path, page])
);

export function resolvePage(pathname) {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return PAGE_BY_PATH[normalizedPath] || "not-found";
}
