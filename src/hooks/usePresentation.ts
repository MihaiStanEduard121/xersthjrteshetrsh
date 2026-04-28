import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, collection, setDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export interface Slide {
  id: string;
  order: number;
  title: string;
  content: string;
  imageUrl?: string;
  speakerNotes?: string;
}

export interface Presentation {
  id: string;
  title: string;
  hostId: string;
  currentSlideIndex: number;
  status: 'waiting' | 'active' | 'ended';
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export function usePresentation(presentationId?: string) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!presentationId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubDoc = onSnapshot(doc(db, 'presentations', presentationId), (d) => {
      if (d.exists()) {
        setPresentation({ id: d.id, ...d.data() } as Presentation);
      } else {
        setError('Presentation not found');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `presentations/${presentationId}`);
    });

    const unsubSlides = onSnapshot(query(collection(db, `presentations/${presentationId}/slides`), orderBy('order')), (snap) => {
      const s = snap.docs.map(x => ({ id: x.id, ...x.data() } as Slide));
      setSlides(s);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `presentations/${presentationId}/slides`);
    });

    const unsubMsg = onSnapshot(query(collection(db, `presentations/${presentationId}/messages`), orderBy('createdAt')), (snap) => {
      const m = snap.docs.map(x => ({ id: x.id, ...x.data() } as Message));
      setMessages(m);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `presentations/${presentationId}/messages`);
    });

    return () => {
      unsubDoc();
      unsubSlides();
      unsubMsg();
    };
  }, [presentationId]);

  const updatePresentation = async (data: Partial<Presentation>) => {
    if (!presentationId) return;
    try {
      await updateDoc(doc(db, 'presentations', presentationId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `presentations/${presentationId}`);
    }
  };

  const addMessage = async (userId: string, userName: string, text: string) => {
    if (!presentationId) return;
    try {
      const newRef = doc(collection(db, `presentations/${presentationId}/messages`));
      await setDoc(newRef, {
        presentationId,
        userId,
        userName,
        text,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `presentations/${presentationId}/messages`);
    }
  };

  return {
    presentation,
    slides,
    messages,
    loading,
    error,
    updatePresentation,
    addMessage,
  };
}
