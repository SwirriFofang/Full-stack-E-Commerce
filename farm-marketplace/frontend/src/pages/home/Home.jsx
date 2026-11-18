import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/hero/Hero";
import FreshDeals from "../../components/freshDeals/FreshDeals";
import CatalogueSection from "../../components/catalogueSection/CatalogueSection";
import ScrollStack from "../../components/scrollStack/ScrollStack";
import AnyFood from "../../components/anyFood/AnyFood";

export default function Home() {
  const location = useLocation();

  // Scroll to the catalogue when a link or filter points there
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.hash]);

  return (
    <div>
      <Hero />
      <FreshDeals />

      {/* The catalogue stays pinned while the green section slides up over it */}
      <ScrollStack id="catalogue" under={<CatalogueSection />}>
        <AnyFood />
      </ScrollStack>
    </div>
  );
}