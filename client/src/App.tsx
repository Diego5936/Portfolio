import Home from "@/pages/Home";
import Projects from "@/pages/Projects";

export default function App() {
  const path = window.location.pathname;

  if (path === "/projects") {
    return <Projects />;
  }

  return <Home />;
}