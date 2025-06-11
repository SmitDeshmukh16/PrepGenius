import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/home/Hero';
import About from './components/home/About';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef(null);

  useEffect(() => {
    // GSAP Animations
    gsap.to("#nav", {
      backgroundColor: "#000",
      duration: 0.5,
      height: "110px",
      scrollTrigger: {
        trigger: "#nav",
        scroller: "body",
        start: "top -10%",
        end: "top -11%",
        scrub: 1,
      },
    });

    gsap.to(mainRef.current, {
      backgroundColor: "#000",
      scrollTrigger: {
        trigger: mainRef.current,
        scroller: "body",
        start: "top -25%",
        end: "top -70%",
        scrub: 2,
      },
    });
  }, []);

  return (
    <>
      <video autoPlay loop muted>
        <source src="./public/video.mp4" type="video/mp4" />
      </video>
      <div ref={mainRef} id="main">
        <Hero />
        <About />
      </div>
    </>
  );
}

export default App;