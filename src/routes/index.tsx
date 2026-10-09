import { createFileRoute } from "@tanstack/react-router";
import { HumanOrNot } from "@/components/human-or-not";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HumanOrNot />;
}
