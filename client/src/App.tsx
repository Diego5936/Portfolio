import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import Experience from "@/pages/Experience";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";

function readLocation() {
  return `${window.location.pathname}${window.location.hash}`;
}

export default function App() {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const syncLocation = () => setLocation(readLocation());

    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);

    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);

  let page = <Home key={location} />;

  if (location.startsWith("/projects")) {
    page = <Projects />;
  } else if (location.startsWith("/experience")) {
    page = <Experience />;
  }

  return (
    <>
      <Header />
      {page}
    </>
  );
}
