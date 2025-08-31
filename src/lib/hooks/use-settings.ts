
"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { ProspectOptions } from '@/lib/types';

const defaultSources = ['Referral', 'Cold Outreach', 'Website', 'Conference', 'Advertisement', 'Other'];
const defaultStatuses = ['New', 'Contacted', 'In-Progress', 'Won', 'Lost'];
const settingsDocRef = doc(db, 'settings', 'prospectOptions');

export function useSettings() {
    const { toast } = useToast();
    const [options, setOptions] = useState<ProspectOptions>({ sources: [], statuses: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchInitialSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const docSnap = await getDoc(settingsDocRef);
            if (!docSnap.exists()) {
                await setDoc(settingsDocRef, { sources: defaultSources, statuses: defaultStatuses });
                setOptions({ sources: defaultSources, statuses: defaultStatuses });
            } else {
                const data = docSnap.data() as ProspectOptions;
                // Handle backward compatibility: if statuses field doesn't exist, add default statuses
                if (!data.statuses) {
                    const updatedData = { ...data, statuses: defaultStatuses };
                    await updateDoc(settingsDocRef, { statuses: defaultStatuses });
                    setOptions(updatedData);
                } else {
                    setOptions(data);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast({
                title: "Error",
                description: "Could not fetch settings.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchInitialSettings();

        const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                setOptions(doc.data() as ProspectOptions);
            }
        });

        return () => unsubscribe();
    }, [fetchInitialSettings]);


    const addSource = async (source: string) => {
        try {
            await updateDoc(settingsDocRef, {
                sources: arrayUnion(source)
            });
            toast({ title: "Success", description: "Source added successfully." });
        } catch (error) {
            console.error("Error adding source:", error);
            toast({
                title: "Error",
                description: "Could not add source.",
                variant: "destructive",
            });
        }
    };

    const deleteSource = async (source: string) => {
        try {
            await updateDoc(settingsDocRef, {
                sources: arrayRemove(source)
            });
            toast({ title: "Success", description: "Source deleted successfully." });
        } catch (error) {
            console.error("Error deleting source:", error);
            toast({
                title: "Error",
                description: "Could not delete source.",
                variant: "destructive",
            });
        }
    };
    
    const updateSources = async (sources: string[]) => {
        try {
            await updateDoc(settingsDocRef, { sources });
            toast({ title: "Success", description: "Sources updated successfully." });
        } catch (error) {
            console.error("Error updating sources:", error);
            toast({
                title: "Error",
                description: "Could not update sources.",
                variant: "destructive",
            });
        }
    }

    const addStatus = async (status: string) => {
        try {
            await updateDoc(settingsDocRef, {
                statuses: arrayUnion(status)
            });
            toast({ title: "Success", description: "Status added successfully." });
        } catch (error) {
            console.error("Error adding status:", error);
            toast({
                title: "Error",
                description: "Could not add status.",
                variant: "destructive",
            });
        }
    };

    const deleteStatus = async (status: string) => {
        try {
            await updateDoc(settingsDocRef, {
                statuses: arrayRemove(status)
            });
            toast({ title: "Success", description: "Status deleted successfully." });
        } catch (error) {
            console.error("Error deleting status:", error);
            toast({
                title: "Error",
                description: "Could not delete status.",
                variant: "destructive",
            });
        }
    };

    const updateStatuses = async (statuses: string[]) => {
        try {
            await updateDoc(settingsDocRef, { statuses });
            toast({ title: "Success", description: "Statuses updated successfully." });
        } catch (error) {
            console.error("Error updating statuses:", error);
            toast({
                title: "Error",
                description: "Could not update statuses.",
                variant: "destructive",
            });
        }
    }

    return { options, isLoading, addSource, deleteSource, updateSources, addStatus, deleteStatus, updateStatuses };
}
