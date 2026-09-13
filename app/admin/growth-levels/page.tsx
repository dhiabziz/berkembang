import { PageHeader } from '@/components/shared/page-header'
import { getGrowthLevels } from '@/lib/data/growth-levels'

import { AddLevelDialog } from './add-level-dialog'
import { LevelList } from './level-list'

// custom growth level rules — admin can define their own levels (name, emoji, points threshold)
export default async function AdminGrowthLevelsPage() {
  const levels = await getGrowthLevels()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Growth levels"
        description="Define the milestones mentees pass through as they earn points."
        action={<AddLevelDialog />}
      />
      <LevelList levels={levels} />
    </main>
  )
}
