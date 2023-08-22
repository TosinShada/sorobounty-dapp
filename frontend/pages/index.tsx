import { Metadata, NextPage } from "next";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useGetStream } from "@/hooks";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

const Tasks: NextPage = () => {
  const { userStreams, updatedAt, refresh } = useGetStream()

  console.log('userStreams', userStreams)

  return (
    <div className="hidden mx-auto max-w-7xl h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Streams</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your payment streams.
          </p>
        </div>
      </div>
      <DataTable data={userStreams} columns={columns} />
    </div>
  );
}

export default Tasks;