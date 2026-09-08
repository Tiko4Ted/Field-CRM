import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Phone, Star, Plus, Trash2, Loader2, Edit2, Check, X } from 'lucide-react';

const API = 'http://localhost:3000';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  isPrimary: boolean;
}

interface School {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
  contacts: Contact[];
}

const contactSchema = z.object({
  name: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  isPrimary: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function SchoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  const { data: school, isLoading } = useQuery<School>({
    queryKey: ['school', id],
    queryFn: () => fetch(`${API}/schools/${id}`).then(r => r.json()),
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', role: '', phone: '', isPrimary: false },
  });

  const addContactMutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      fetch(`${API}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, schoolId: id }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      contactForm.reset();
      setShowAddContact(false);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) =>
      fetch(`${API}/contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: () =>
      fetch(`${API}/schools/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      navigate('/schools');
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) =>
      fetch(`${API}/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setEditingName(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-32 bg-muted rounded-lg" />
        <div className="space-y-3 mt-6">
          {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">School not found.</p>
        <button onClick={() => navigate('/schools')} className="mt-4 text-sm text-primary font-medium">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/schools')}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mt-0.5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="h-9 px-3 rounded-lg border border-primary bg-card text-foreground text-lg font-bold
                           focus:outline-none focus:ring-2 focus:ring-primary/30 flex-1"
                autoFocus
              />
              <button
                onClick={() => updateNameMutation.mutate(nameValue)}
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-xl font-bold tracking-tight">{school.name}</h2>
              <button
                onClick={() => { setNameValue(school.name); setEditingName(true); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground
                           opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {school.notes && (
            <p className="text-sm text-muted-foreground mt-1">{school.notes}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Added {new Date(school.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Contacts ({school.contacts.length})</h3>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {school.contacts.length === 0 && !showAddContact && (
          <p className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-border">
            No contacts yet.
          </p>
        )}

        <div className="space-y-2">
          {school.contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">{contact.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{contact.name}</span>
                  {contact.isPrimary && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{contact.role}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center
                           text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => deleteContactMutation.mutate(contact.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                           hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add contact inline */}
        {showAddContact && (
          <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  {...contactForm.register('name')}
                  placeholder="e.g. Mr Kamau"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <input
                  {...contactForm.register('role')}
                  placeholder="e.g. ICT Teacher"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                {...contactForm.register('phone')}
                placeholder="e.g. 0723 xxx xxx"
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...contactForm.register('isPrimary')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
              <span className="text-xs font-medium">Primary follow-up contact</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={contactForm.handleSubmit((data) => addContactMutation.mutate(data))}
                disabled={addContactMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg
                           hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {addContactMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
              <button
                type="button"
                onClick={() => { contactForm.reset(); setShowAddContact(false); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                           rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => {
            if (confirm('Delete this school and all its contacts?')) {
              deleteSchoolMutation.mutate();
            }
          }}
          className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
        >
          Delete school
        </button>
      </div>
    </div>
  );
}
