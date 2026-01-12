import { About } from '../components/About';
import { Partner } from '../components/Partner';
import { Contacts } from '../components/Contact';
import { Counter } from '../components/Counter';
import { FAQs } from '../components/FAQs';
import { Gallery } from '../components/Gallery';
import { Hero } from '../components/Hero';
import { Mentors } from '../components/Mentors';
import { Team } from '../components/Team';
import { Genie } from '../components/Genie';
import { Tabs } from '../components/Tabs';
import { Testimonials } from '../components/Testimonials';
import { useEffect } from 'react';


export const Home = () =>{
  useEffect(() => {
    document.body.style.backgroundImage = "none";
    
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");
    if (header) header.style.top = "0%"; 
    if (footer) footer.style.display = "block"; 
  }, [])
  
  return (
    <>
      <Hero />
      <main id="main">
        <Partner />
        <About />
        <Counter />
        <Tabs />
        <Genie />
        <Gallery />
        <Testimonials />
        <Team />
        <FAQs />
        <Mentors />
        <Contacts />
      </main>
    </>
  );
}

