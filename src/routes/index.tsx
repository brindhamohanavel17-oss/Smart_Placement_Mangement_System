import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlacementAI — Placement Prep & Skill Development Platform" },
      {
        name: "description",
        content:
          "PlacementAI tracks placement readiness, closes skill gaps with an adaptive roadmap, and includes an AI placement coach for personalised prep guidance.",
      },
      { property: "og:title", content: "PlacementAI — Mission Control for Placement Readiness" },
      {
        property: "og:description",
        content:
          "Readiness scoring, skill-gap analysis, coding practice, mock interviews and an AI placement coach in one platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <h1 className="sr-only">
        PlacementAI — smart placement preparation and skill development platform
      </h1>
      <iframe
        src="/placementai.html"
        title="PlacementAI platform"
        className="h-full w-full border-0"
      />
    </main>
  );
}
