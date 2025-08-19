
import { EdicionesPage, Hero, BlogSection, SloganPage } from '../../components/layout/public';



const HomePage = () => {
  return (
    <div>

    
      <Hero  />
      <SloganPage />
      <EdicionesPage />
      <BlogSection />
      


      {/* Otras secciones de la página */}
      <section className="py-20 px-4 sm:px-6 lg:px-8"></section>
    </div>
  );
};

export default HomePage;
