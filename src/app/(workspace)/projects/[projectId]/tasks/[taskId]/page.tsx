import { ProjectView } from "@/components/project-views";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const params = await promise;
  return (
    <ProjectView
      projectId={params.projectId}
      section="overview"
      taskId={params.taskId}
    />
  );
}
