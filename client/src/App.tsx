import Experience from "@/pages/Experience";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";

export default function App() {
  const path = window.location.pathname;

  if (path === "/projects") {
    return <Projects />;
  }

  if (path === "/experience") {
    return <Experience />;
  }

  return <Home />;
}