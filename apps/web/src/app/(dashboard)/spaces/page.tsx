import { lazy, Suspense } from 'react';

import { SpaceList } from '../../../modules/space/components/space-list';

const CreateSpaceModal = lazy(() =>
  import('../../../modules/space/components/create-space-modal').then((mod) => ({
    default: mod.CreateSpaceModal,
  })),
);

export default function SpacesPage() {
  return (
    <section className="h-full w-full p-4 max-md:pt-16">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-inter tracking-tight md:text-xl">Spaces</h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground max-md:hidden">
              Manage your collaborative spaces and teams.
            </p>
          </div>
          <Suspense fallback={<div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />}>
            <CreateSpaceModal />
          </Suspense>
        </div>

        <SpaceList />
      </div>
    </section>
  );
}
