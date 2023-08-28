import { Metadata, NextPage } from 'next'
import { ResolveName } from '@/components/resolve'

export const metadata: Metadata = {
  title: 'Resolve Name',
  description: 'Resolve a name to an address',
}

const Resolve: NextPage = () => {
  return (
    <div className="hidden mx-auto self-center flex-grow space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <ResolveName />
        </div>
      </div>
    </div>
  )
}

export default Resolve
