import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Stream } from '@tide/stream-contract'
import { formatAmount, formatTimestamp } from '@/lib/utils'
import FlowingBalance from '@/components/flowing-balance'

export const columns: ColumnDef<Stream>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stream Id" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'token_symbol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asset Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('token_symbol')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'remaining_balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining Balance" />
    ),
    cell: ({ row }) => {
      const remainingBalance = row.original.remaining_balance
      const decimal = row.original.token_decimals
      const flowRate = row.original.rate_per_second
      const startTime = row.original.start_time
      return (
        <div className="w-[120px]">
          <FlowingBalance {...{ remainingBalance, decimal, flowRate, startTime }} />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'rate_per_second',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow Rate" />
    ),
    cell: ({ row }) => {
      const decimal = row.original.token_decimals
      const flowRate = row.original.rate_per_second * 86400n
      return (
        <div className="w-[120px]">{`${formatAmount(flowRate, decimal)}/day`}</div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'sender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender" />
    ),
    cell: ({ row }) => {
      const address = row.getValue<string>('sender')
      return (
        <div className="w-[150px]">
          {`${address.slice(0, 4)}...${address.slice(-4)}`}
        </div>
      )
    },
  },
  {
    accessorKey: 'recipient',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recipient" />
    ),
    cell: ({ row }) => {
      const address = row.getValue<string>('recipient')
      return (
        <div className="w-[150px]">
          {`${address.slice(0, 4)}...${address.slice(-4)}`}
        </div>
      )
    },
  },
  {
    accessorKey: 'start_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const startTime = formatTimestamp(row.getValue('start_time'))
      return (
        <div className="w-[150px]">
          {format(new Date(startTime), 'do MMM, yyyy HH:mm')}
        </div>
      )
    },
  },
  {
    accessorKey: 'stop_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const stopTime = formatTimestamp(row.getValue('stop_time'))
      return (
        <div className="w-[150px]">
          {format(new Date(stopTime), 'do MMM, yyyy HH:mm')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
