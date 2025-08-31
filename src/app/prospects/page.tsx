
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useProspects } from '@/lib/hooks/use-prospects';
import { useSettings } from '@/lib/hooks/use-settings';
import { Prospect, ProspectStatus, WarmColdStatus } from '@/lib/types';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { ProspectFormDialog, ProspectFormValues } from './components/prospect-form-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ProspectsPage() {
  const { prospects, isLoading, addProspect, updateProspect, deleteProspect } = useProspects();
  const { options } = useSettings();
  
  // Use configurable status options or fallback to defaults
  const statusOptions: (ProspectStatus | 'All')[] = ['All', ...(options?.statuses as ProspectStatus[] || ['New', 'Contacted', 'In-Progress', 'Won', 'Lost'])];
  const tempOptions: (WarmColdStatus | 'All')[] = ['All', 'Hot', 'Cold'];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'All'>('All');
  const [tempFilter, setTempFilter] = useState<WarmColdStatus | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  const filteredProspects = useMemo(() => {
    if (!prospects) return [];
    return prospects.filter(prospect => {
      const searchMatch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'All' || prospect.current_status === statusFilter;
      const tempMatch = tempFilter === 'All' || prospect.warm_cold_status === tempFilter;
      
      let dateMatch = true;
      if (dateRange?.from) {
        dateMatch = parseISO(prospect.date_added) >= dateRange.from;
      }
      if (dateRange?.to) {
        dateMatch = dateMatch && parseISO(prospect.date_added) <= dateRange.to;
      }

      return searchMatch && statusMatch && tempMatch && dateMatch;
    });
  }, [prospects, searchTerm, statusFilter, tempFilter, dateRange]);

  const handleAddClick = () => {
    setEditingProspect(null);
    setIsFormOpen(true);
  };

  const handleEdit = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ProspectFormValues) => {
    // Convert ProspectFormValues to the format expected by addProspect/updateProspect
    const prospectData = {
      ...data,
      current_status: data.current_status as ProspectStatus, // Cast string back to ProspectStatus
      last_contact_date: data.last_contact_date || undefined, // Convert null to undefined
      follow_up_date: data.follow_up_date || undefined, // Convert null to undefined
    };
    
    if (editingProspect) {
      updateProspect(editingProspect.id, prospectData);
    } else {
      addProspect(prospectData);
    }
    setIsFormOpen(false);
    setEditingProspect(null);
  };

  const handleDelete = (id: string) => {
    deleteProspect(id);
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Prospects</h1>
            <p className="text-muted-foreground">View, search, and manage all your prospects in one place.</p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Prospect
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="Search prospects..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProspectStatus | 'All')}>
            <SelectTrigger className="w-auto md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tempFilter} onValueChange={(value) => setTempFilter(value as WarmColdStatus | 'All')}>
            <SelectTrigger className="w-auto md:w-[180px]">
              <SelectValue placeholder="Filter by temperature" />
            </SelectTrigger>
            <SelectContent>
              {tempOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-auto md:w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {(dateRange?.from || dateRange?.to) && (
            <Button variant="ghost" onClick={() => setDateRange(undefined)}>Clear</Button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="text-center p-8">Loading prospects...</div>
      ) : (
        <DataTable
          columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
          data={filteredProspects}
        />
      )}
      <ProspectFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        prospect={editingProspect}
      />
    </main>
  );
}
