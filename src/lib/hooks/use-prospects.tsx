"use client";

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Prospect } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

interface ProspectsContextType {
    prospects: Prospect[];
    isLoading: boolean;
    addProspect: (prospect: Omit<Prospect, 'id' | 'created_at' | 'date_added'>) => Promise<void>;
    updateProspect: (id: string, updatedData: Partial<Omit<Prospect, 'id'>>) => Promise<void>;
    deleteProspect: (id: string) => Promise<void>;
}

const ProspectsContext = createContext<ProspectsContextType | undefined>(undefined);


const getInitialData = (): Omit<Prospect, 'id' | 'created_at' | 'date_added'>[] => [
    {
    name: 'Innovate Corp',
    source: 'Referral',
    current_status: 'Contacted',
    last_contact_date: new Date(2023, 11, 1).toISOString(),
    follow_up_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    notes: 'Expressed strong interest in our enterprise package. Budget confirmed. Decision maker is the CTO, Jane Doe. Follow-up to schedule a demo.',
    warm_cold_status: 'Hot',
    pain_points: 'Current solution is too slow and lacks key integrations.',
    objections: 'Concerned about migration timeline.',
  },
  {
    name: 'Data Solutions Ltd.',
    source: 'Cold Outreach',
    current_status: 'In-Progress',
    last_contact_date: new Date(2023, 11, 5).toISOString(),
    follow_up_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    notes: 'Initial call was positive. They are evaluating competitors. Need to highlight our superior analytics features in the next call.',
    warm_cold_status: 'Hot',
    pain_points: 'Lack of real-time data visualization.',
  },
  {
    name: 'NextGen Systems',
    source: 'Website',
    current_status: 'New',
    notes: 'Filled out contact form on the website. Requested a pricing guide. Seems like a small to medium business.',
    warm_cold_status: 'Cold',
  },
  {
    name: 'Global Tech Inc.',
    source: 'Conference',
    current_status: 'Won',
    notes: 'Met at the Tech Summit. Deal closed after a 3-month cycle. Successfully onboarded.',
    warm_cold_status: 'Hot',
  }
];

const prospectsCollection = collection(db, 'prospects');

const fromFirestore = (doc: any): Prospect => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date_added: data.date_added?.toDate().toISOString(),
    created_at: data.created_at?.toDate().toISOString(),
    last_contact_date: data.last_contact_date?.toDate()?.toISOString(),
    follow_up_date: data.follow_up_date?.toDate()?.toISOString(),
  };
};

const toFirestore = (prospect: Partial<Omit<Prospect, 'id'>>) => {
    const data: { [key: string]: any } = { ...prospect };
    for (const key of Object.keys(data)) {
        if (data[key] === undefined) {
            data[key] = null;
        }
    }
    for (const key of ['last_contact_date', 'follow_up_date']) {
        const dateValue = data[key];
        if (dateValue && typeof dateValue === 'string') {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                data[key] = Timestamp.fromDate(date);
            } else {
                data[key] = null;
            }
        } else if (dateValue instanceof Date) {
             data[key] = Timestamp.fromDate(dateValue);
        }
    }
    return data;
};

export const ProspectsProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProspects = useCallback(async () => {
        setIsLoading(true);
        try {
          const q = query(prospectsCollection, orderBy('date_added', 'desc'));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            const batch = writeBatch(db);
            const initialData = getInitialData();
            
            initialData.forEach(prospectData => {
              const docRef = doc(prospectsCollection);
              batch.set(docRef, { 
                  ...toFirestore(prospectData),
                  date_added: serverTimestamp(),
                  created_at: serverTimestamp(),
              });
            });
            await batch.commit();
            
            const seededSnapshot = await getDocs(q);
            setProspects(seededSnapshot.docs.map(fromFirestore));
    
          } else {
            setProspects(snapshot.docs.map(fromFirestore));
          }
        } catch (error) {
          console.error("Failed to fetch prospects from Firestore", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load data from Firestore.",
          });
        } finally {
          setIsLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchProspects();
      }, [fetchProspects]);


    const addProspect = useCallback(async (prospect: Omit<Prospect, 'id' | 'created_at' | 'date_added'>) => {
        try {
        const docData = {
            ...toFirestore(prospect),
            date_added: serverTimestamp(),
            created_at: serverTimestamp(),
        }
        await addDoc(prospectsCollection, docData);
        await fetchProspects();
        toast({ title: "Success", description: "Prospect added successfully." });
        } catch(error) {
            console.error("Error adding document: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not add prospect.",
            });
        }
    }, [toast, fetchProspects]);
    
    const updateProspect = useCallback(async (id: string, updatedData: Partial<Omit<Prospect, 'id'>>) => {
        try {
            const prospectDoc = doc(db, 'prospects', id);
            await updateDoc(prospectDoc, toFirestore(updatedData));
            await fetchProspects();
            toast({ title: "Success", description: "Prospect updated successfully." });
        } catch(error) {
            console.error("Error updating document: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update prospect.",
            });
        }
    }, [toast, fetchProspects]);
    
    const deleteProspect = useCallback(async (id: string) => {
        try {
            await deleteDoc(doc(db, 'prospects', id));
            setProspects(prev => prev.filter(p => p.id !== id));
            toast({ title: "Success", description: "Prospect deleted successfully." });
        } catch(error) {
            console.error("Error deleting document: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete prospect.",
            });
        }
    }, [toast]);
    

    const value = { prospects, isLoading, addProspect, updateProspect, deleteProspect };

    return (
        <ProspectsContext.Provider value={value}>
            {children}
        </ProspectsContext.Provider>
    );
}

export const useProspects = () => {
    const context = useContext(ProspectsContext);
    if(context === undefined) {
        throw new Error('useProspects must be used within a ProspectsProvider');
    }
    return context;
}
