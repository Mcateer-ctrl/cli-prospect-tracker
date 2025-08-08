
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useProspects } from '@/lib/hooks/use-prospects';
import { format, isSameDay, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
    const { prospects, isLoading } = useProspects();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const followUpDays = useMemo(() => {
        if (!prospects) return [];
        return prospects
            .filter(p => p.follow_up_date)
            .map(p => parseISO(p.follow_up_date!));
    }, [prospects]);

    const prospectsForSelectedDay = useMemo(() => {
        if (!selectedDate || !prospects) return [];
        return prospects.filter(p => p.follow_up_date && isSameDay(parseISO(p.follow_up_date), selectedDate));
    }, [prospects, selectedDate]);

    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-full">
            <p>Loading calendar...</p>
          </div>
        );
      }

    return (
        <main className="p-4 md:p-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Follow-up Calendar</h1>
                <p className="text-muted-foreground">Stay on top of your schedule with a calendar view of all your follow-ups.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardContent className="p-2 md:p-6 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ followUp: followUpDays }}
                        modifiersStyles={{ 
                            followUp: { 
                                color: 'hsl(var(--primary-foreground))',
                                backgroundColor: 'hsl(var(--primary))' 
                            }
                        }}
                        className="rounded-md"
                    />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>
                           Follow-ups for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '...'}
                        </CardTitle>
                        <CardDescription>
                            {prospectsForSelectedDay.length} prospect(s) to follow up with.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <p>Loading...</p>
                        ) : prospectsForSelectedDay.length > 0 ? (
                            <div className="space-y-4">
                                {prospectsForSelectedDay.map(prospect => (
                                    <div key={prospect.id} className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarFallback>{prospect.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Link href={`/prospects`}>
                                                <p className="font-medium hover:underline">{prospect.name}</p>
                                            </Link>
                                            <p className="text-sm text-muted-foreground">{prospect.source}</p>
                                        </div>
                                         <Badge variant={prospect.warm_cold_status === 'Hot' ? 'destructive' : 'secondary'}>{prospect.warm_cold_status}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No follow-ups scheduled for this day.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
