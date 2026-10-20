import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, publishedServices } from "@/data/services";
import { buildMetadata } from "@/lib/seo";
import { ServiceDetail } from "@/components/services/ServiceDetail";

// Must stay true: portal edits revalidate every page (the footer is on all of them), and Next 16
// answers an expired dynamicParams=false path with 404 instead of rebuilding it. Unknown slugs
// still return 404 through notFound() in the page.
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || service.status !== "published") return { title: "Service not found" };
  return buildMetadata({
    title: `${service.title} Services`,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || service.status !== "published") notFound();
  return <ServiceDetail service={service} />;
}
