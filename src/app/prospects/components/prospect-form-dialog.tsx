
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Prospect, ProspectStatus, WarmColdStatus } from '@/lib/types';
import { useSettings } from '@/lib/hooks/use-settings';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const prospectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  source: z.string(),
  current_status: z.enum(['New', 'Contacted', 'In-Progress', 'Won', 'Lost']),
  warm_cold_status: z.enum(['Hot', 'Cold']),
  last_contact_date: z.date().optional().nullable(),
  follow_up_date: z.date().optional().nullable(),
  notes: z.string(),
  objections: z.string().optional(),
  pain_points: z.string().optional(),
});

type ProspectFormValues = Omit<z.infer<typeof prospectSchema>, 'last_contact_date' | 'follow_up_date'> & {
    last_contact_date?: string | null;
    follow_up_date?: string | null;
}

interface ProspectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: ProspectFormValues) => void;
  prospect: Prospect | null;
}

const statusOptions: ProspectStatus[] = ['New', 'Contacted', 'In-Progress', 'Won', 'Lost'];
const tempOptions: WarmColdStatus[] = ['Hot', 'Cold'];

export function ProspectFormDialog({ isOpen, onOpenChange, onSubmit, prospect }: ProspectFormDialogProps) {
  const { options, isLoading: isLoadingSettings } = useSettings();
  
  const form = useForm<z.infer<typeof prospectSchema>>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      name: '',
      notes: '',
      objections: '',
      pain_points: '',
      last_contact_date: null,
      follow_up_date: null,
    },
  });

  useEffect(() => {
    if (prospect) {
      form.reset({
        ...prospect,
        last_contact_date: prospect.last_contact_date ? new Date(prospect.last_contact_date) : null,
        follow_up_date: prospect.follow_up_date ? new Date(prospect.follow_up_date) : null,
      });
    } else {
      form.reset({
        name: '',
        source: options?.sources[0] || '',
        current_status: 'New',
        warm_cold_status: 'Cold',
        notes: '',
        objections: '',
        pain_points: '',
        last_contact_date: null,
        follow_up_date: null,
      });
    }
  }, [prospect, form, isOpen, options]);

  const handleSubmit = (values: z.infer<typeof prospectSchema>) => {
    onSubmit({
        ...values,
        last_contact_date: values.last_contact_date?.toISOString() || null,
        follow_up_date: values.follow_up_date?.toISOString() || null,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prospect ? 'Edit Prospect' : 'Add New Prospect'}</DialogTitle>
          <DialogDescription>
            {prospect ? 'Update the details for this prospect.' : 'Fill in the details for the new prospect.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-1 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingSettings}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {options?.sources.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="current_status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="warm_cold_status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Temperature</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select temperature" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {tempOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="last_contact_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Last Contact Date</FormLabel>
                         <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="follow_up_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Follow Up Date</FormLabel>
                         <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="pain_points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Points</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="objections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objections</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save prospect</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
