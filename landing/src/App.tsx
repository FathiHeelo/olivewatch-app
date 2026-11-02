import Closing from './sections/Closing';
import DataSources from './sections/DataSources';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import LiveDemo from './sections/LiveDemo';
import Questions from './sections/Questions';

export default function App() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <LiveDemo />
      <DataSources />
      <Questions />
      <Closing />
      <Footer />
    </main>
  );
}
