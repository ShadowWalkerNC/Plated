import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/db/queries';
import { ProjectEditor } from '@/components/ProjectEditor';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return null;

  const project = await getProject(params.id, userId);
  if (!project) notFound();

  return <ProjectEditor project={project} />;
}
