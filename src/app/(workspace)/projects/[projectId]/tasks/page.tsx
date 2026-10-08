import { ProjectView } from "@/components/project-views";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const params = await promise;
  return <ProjectView projectId={params.projectId} section="tasks" />;
}
