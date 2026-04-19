// App.jsx — メインエントリーポイント
// 各セクションコンポーネントをここで統合する

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import Demo from "./components/Demo";
import Process from "./components/Process";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Demo />
        <Process />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
