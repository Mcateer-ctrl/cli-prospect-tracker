"use client";

import { Prospect } from "@/lib/types";
import { ColumnDef } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { ProspectActions } from "./prospect-actions";
import { format } from 'date-fns';

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Contacted': 'default',
  'In-Progress': 'outline',
  'Won': 'default', // would be better with a success variant
  'Lost': 'destructive',
};


export const columns = ({ onEdit, onDelete }: { onEdit: (prospect: Prospect) => void; onDelete: (id: string) => void; }): ColumnDef<Prospect>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
  },
  {
    accessorKey: "current_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariantMap[row.original.current_status] || 'default'}>
        {row.original.current_status}
      </Badge>
    )
  },
  {
    accessorKey: "warm_cold_status",
    header: "Temperature",
    cell: ({ row }) => {
        const temp = row.original.warm_cold_status;
        return <Badge variant={temp === 'Hot' ? 'destructive' : 'secondary'}>{temp}</Badge>
    }
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "follow_up_date",
    header: "Follow Up",
    cell: ({ row }) => {
      const dateStr = row.original.follow_up_date;
      if (!dateStr) return 'N/A';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, 'MMM d, yyyy');
      } catch (e) {
        return 'N/A';
      }
    }
  },
  {
    accessorKey: "last_contact_date",
    header: "Last Contact",
    cell: ({ row }) => {
       const dateStr = row.original.last_contact_date;
       if (!dateStr) return 'N/A';
       try {
         const date = new Date(dateStr);
         if (isNaN(date.getTime())) return 'N/A';
         return format(date, 'MMM d, yyyy');
       } catch (e) {
         return 'N/A';
       }
    }
  },
  {
    accessorKey: "date_added",
    header: "Date Added",
    cell: ({ row }) => {
       const dateStr = row.original.date_added;
       if (!dateStr) return 'N/A';
       try {
         const date = new Date(dateStr);
         if (isNaN(date.getTime())) return 'N/A';
         return format(date, 'MMM d, yyyy');
       } catch (e) {
         return 'N/A';
       }
    }
  },
  {
    accessorKey: "pain_points",
    header: "Pain Points",
    cell: ({ row }) => <div className="truncate max-w-xs">{row.original.pain_points || 'N/A'}</div>
  },
  {
    accessorKey: "objections",
    header: "Objections",
    cell: ({ row }) => <div className="truncate max-w-xs">{row.original.objections || 'N/A'}</div>
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <ProspectActions
          prospect={row.original}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original.id)}
        />
      </div>
    ),
  },
];
