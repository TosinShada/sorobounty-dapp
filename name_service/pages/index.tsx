import { Metadata, NextPage } from 'next'

import { SearchName } from '@/components/search/form'

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'A task and issue tracker build using Tanstack Table.',
}

const Tasks: NextPage = () => {
  return (
    <div className="hidden mx-auto self-center flex-grow space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <SearchName />
        </div>
      </div>
    </div>
  )
}

export default Tasks
