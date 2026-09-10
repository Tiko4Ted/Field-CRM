import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Phone, Star, Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import api from '../lib/api';


interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  notes: string | null;
  isPrimary: boolean;
}

interface School {
  id: string;
  name: string;
  notes: string | null;
  visitedAt: string;
  followUpDate: string | null;
  followUpNotes: string | null;
  status: string;
  createdAt: string;
  contacts: Contact[];
}

const contactSchema = z.object({
  name: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  isPrimary: z.boolean(),
});

const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  status: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;
type SchoolFormData = z.infer<typeof schoolSchema>;

const statusLabels: Record<string, string> = {
  VISITED: 'Visited',
  FOLLOW_UP: 'Follow-up',
  BOOKED: 'Booked',
  CANCELLED: 'Cancelled',
};

function toDateInput(value: string | null | undefined) {
  return value ? value.split('T')[0] : '';
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function SchoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingSchool, setEditingSchool] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const { data: school, isLoading } = useQuery<School>({
    queryKey: ['school', id],
    queryFn: () => api.get(`/schools/${id}`).then(r => r.data),
  });

  const schoolForm = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { name: '', notes: '', followUpDate: '', followUpNotes: '', status: 'VISITED' },
  });

  const addContactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', role: '', phone: '', notes: '', isPrimary: false },
  });

  const editContactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', role: '', phone: '', notes: '', isPrimary: false },
  });

  useEffect(() => {
    if (school) {
      schoolForm.reset({
        name: school.name,
        notes: school.notes || '',
        followUpDate: toDateInput(school.followUpDate),
        followUpNotes: school.followUpNotes || '',
        status: school.status || 'VISITED',
      });
    }
  }, [school, schoolForm]);

  const invalidateSchool = () => {
    queryClient.invalidateQueries({ queryKey: ['school', id] });
    queryClient.invalidateQueries({ queryKey: ['schools'] });
  };

  const addContactMutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      api.post('/contacts', { ...data, schoolId: id }).then(r => r.data),
    onSuccess: () => {
      invalidateSchool();
      addContactForm.reset();
      setShowAddContact(false);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: ContactFormData }) =>
      api.patch(`/contacts/${contactId}`, data).then(r => r.data),
    onSuccess: () => {
      invalidateSchool();
      setEditingContactId(null);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) =>
      api.delete(`/contacts/${contactId}`),
    onSuccess: invalidateSchool,
  });

  const updateSchoolMutation = useMutation({
    mutationFn: (data: SchoolFormData) =>
      api.patch(`/schools/${id}`, {
          ...data,
          followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
        }).then(r => r.data),
    onSuccess: () => {
      invalidateSchool();
      setEditingSchool(false);
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: () =>
      api.delete(`/schools/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      navigate('/schools');
    },
  });

  const startContactEdit = (contact: Contact) => {
    editContactForm.reset({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      notes: contact.notes || '',
      isPrimary: contact.isPrimary,
    });
    setEditingContactId(contact.id);
  };

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
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/schools')}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mt-0.5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          {!editingSchool ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight truncate">{school.name}</h2>
                <button
                  onClick={() => setEditingSchool(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                             hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
                  aria-label="Edit school"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
                  {statusLabels[school.status] || school.status}
                </span>
                <span className="text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  Visited {formatDate(school.visitedAt || school.createdAt)}
                </span>
                {school.followUpDate && (
                  <span className="text-amber-700 bg-amber-500/10 px-2 py-1 rounded-md">
                    Follow-up {formatDate(school.followUpDate)}
                  </span>
                )}
              </div>

              {school.notes && (
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">{school.notes}</p>
              )}
              {school.followUpNotes && (
                <div className="mt-3 rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Follow-up Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{school.followUpNotes}</p>
                </div>
              )}
            </>
          ) : (
            <form
              onSubmit={schoolForm.handleSubmit((data) => updateSchoolMutation.mutate(data))}
              className="space-y-3"
            >
              <input
                {...schoolForm.register('name')}
                className="w-full h-10 px-3 rounded-lg border border-primary bg-card text-foreground text-lg font-bold
                           focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <textarea
                {...schoolForm.register('notes')}
                rows={3}
                placeholder="Visit notes"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  {...schoolForm.register('followUpDate')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <select
                  {...schoolForm.register('status')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="VISITED">Visited</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="BOOKED">Booked</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <textarea
                {...schoolForm.register('followUpNotes')}
                rows={2}
                placeholder="Follow-up notes"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateSchoolMutation.isPending}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg
                             hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updateSchoolMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    schoolForm.reset({
                      name: school.name,
                      notes: school.notes || '',
                      followUpDate: toDateInput(school.followUpDate),
                      followUpNotes: school.followUpNotes || '',
                      status: school.status || 'VISITED',
                    });
                    setEditingSchool(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                             rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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
          {school.contacts.map((contact) => {
            const isEditing = editingContactId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-3 rounded-xl bg-card border border-border"
              >
                {!isEditing ? (
                  <div className="flex items-center gap-3">
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
                      {contact.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.notes}</p>
                      )}
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      aria-label={`Call ${contact.name}`}
                      className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center
                                 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => startContactEdit(contact)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                                 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this contact?')) {
                          deleteContactMutation.mutate(contact.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                                 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      aria-label={`Delete ${contact.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={editContactForm.handleSubmit((data) =>
                      updateContactMutation.mutate({ contactId: contact.id, data }),
                    )}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        {...editContactForm.register('name')}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <input
                        {...editContactForm.register('role')}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <input
                      {...editContactForm.register('phone')}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <textarea
                      {...editContactForm.register('notes')}
                      rows={2}
                      placeholder="Contact notes"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...editContactForm.register('isPrimary')}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs font-medium">Primary follow-up contact</span>
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updateContactMutation.isPending}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg
                                   hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updateContactMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingContactId(null)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                                   rounded-lg hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        {showAddContact && (
          <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  {...addContactForm.register('name')}
                  placeholder="e.g. Mr Kamau"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <input
                  {...addContactForm.register('role')}
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
                {...addContactForm.register('phone')}
                placeholder="e.g. 0723 xxx xxx"
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Notes</label>
              <textarea
                {...addContactForm.register('notes')}
                rows={2}
                placeholder="Response, relationship, preferred follow-up, etc."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground
                           placeholder:text-muted-foreground resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...addContactForm.register('isPrimary')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
              <span className="text-xs font-medium">Primary follow-up contact</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={addContactForm.handleSubmit((data) => addContactMutation.mutate(data))}
                disabled={addContactMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg
                           hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {addContactMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
              <button
                type="button"
                onClick={() => { addContactForm.reset(); setShowAddContact(false); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                           rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

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
