import { Experience } from "@/components/experience/experience";
import { loadCatalog } from "@/lib/content/service";

export default function Home() {
  const catalog = loadCatalog();
  return <Experience catalog={catalog} />;
}
