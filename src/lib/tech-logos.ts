/** SVG paths via jsDelivr Simple Icons (reliable CDN). */
export const technologyLogos = [
  { name: "AWS", slug: "amazonaws" },
  { name: "Azure", slug: "microsoftazure" },
  { name: "Google Cloud", slug: "googlecloud" },
  { name: "Python", slug: "python" },
  { name: "Java", slug: "openjdk" },
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "TensorFlow", slug: "tensorflow" },
] as const;

export function techLogoUrl(slug: string) {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
}
