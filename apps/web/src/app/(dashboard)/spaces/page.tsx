import { lazy, Suspense } from 'react';

import { SpaceList } from '../../../modules/space/components/space-list';

const CreateSpaceModal = lazy(() =>
  import('../../../modules/space/components/create-space-modal').then((mod) => ({
    default: mod.CreateSpaceModal,
  })),
);

export default function SpacesPage() {
  return (
    <section className="h-full w-full p-4 max-md:pt-16 mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-inter tracking-tight font-semibold">Spaces</h1>
          <p className="mt-0.5 text-xs text-muted-foreground max-md:hidden">
            Manage your collaborative spaces and teams.
          </p>
        </div>
        <Suspense fallback={<div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />}>
          <CreateSpaceModal />
        </Suspense>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <SpaceList />
      </div>
    </section>
  );
}
