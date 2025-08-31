"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/lib/hooks/use-settings";
import { Trash2, PlusCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const settingsSchema = z.object({
    sources: z.array(z.object({
        name: z.string().min(1, "Source name cannot be empty."),
    })),
    statuses: z.array(z.object({
        name: z.string().min(1, "Status name cannot be empty."),
    }))
});

export default function SettingsPage() {
    const { options, isLoading, addSource, deleteSource, updateSources, addStatus, deleteStatus, updateStatuses } = useSettings();
    const [newSource, setNewSource] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const form = useForm({
        resolver: zodResolver(settingsSchema),
        values: {
            sources: options?.sources.map(s => ({ name: s })) || [],
            statuses: options?.statuses.map(s => ({ name: s })) || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'sources'
    });

    const handleAddNewSource = () => {
        if(newSource.trim() !== '') {
            addSource(newSource);
            setNewSource('');
        }
    }
    
    const handleDeleteSource = (sourceName: string) => {
        deleteSource(sourceName);
    }

    const handleAddNewStatus = () => {
        if(newStatus.trim() !== '') {
            addStatus(newStatus);
            setNewStatus('');
        }
    }
    
    const handleDeleteStatus = (statusName: string) => {
        deleteStatus(statusName);
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
            <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <main className="p-4 md:p-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application settings and preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Prospect Sources</CardTitle>
                    <CardDescription>Add, edit, or remove the sources available in the prospect form.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        {options?.sources.map((source, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input disabled value={source} className="flex-1" />
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                        <Input 
                            value={newSource}
                            onChange={(e) => setNewSource(e.target.value)}
                            placeholder="Add a new source"
                            className="flex-1"
                        />
                        <Button onClick={handleAddNewSource}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Source
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prospect Statuses</CardTitle>
                    <CardDescription>Add, edit, or remove the status options available in the prospect form.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        {options?.statuses.map((status, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input disabled value={status} className="flex-1" />
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStatus(status)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                        <Input 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            placeholder="Add a new status"
                            className="flex-1"
                        />
                        <Button onClick={handleAddNewStatus}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Status
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
