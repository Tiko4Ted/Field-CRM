import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, Plus, Trash2, Import, Clock } from 'lucide-react';
import api from '../lib/api';


interface Intelligence {
  id: string;
  name: string;
  source: string | null;
  intell: string | null;
  bestTimeToVisit: string | null;
  location: string | null;
  plannedVisitDate: string | null;
  status: string;
}

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().min(1, 'Phone is required'),
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

type SchoolForm = z.infer<typeof schoolSchema>;
type ContactForm = z.infer<typeof contactSchema>;

export default function SchoolsCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedIntellId, setSelectedIntellId] = useState<string | null>(location.state?.importId || null);

  // Fetch PLANNED intelligence records for importing
  const { data: intellRecords = [] } = useQuery<Intelligence[]>({
    queryKey: ['intelligence'],
    queryFn: () => api.get(`/intelligence`).then(r => r.data),
  });
  const plannedIntell = intellRecords.filter(r => r.status === 'PLANNED');

  const schoolForm = useForm<SchoolForm>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { name: '', notes: '', followUpDate: '', followUpNotes: '', status: 'VISITED' },
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', role: '', phone: '', notes: '', isPrimary: false },
  });

  // Auto-fill if we navigated with an importId
  useEffect(() => {
    if (selectedIntellId && plannedIntell.length > 0) {
      const record = plannedIntell.find(r => r.id === selectedIntellId);
      if (record) {
        schoolForm.setValue('name', record.name);
        schoolForm.setValue('notes', record.intell || '');
        const followUpParts = [
          record.source ? `Source: ${record.source}` : null,
          record.bestTimeToVisit ? `Best time to visit: ${record.bestTimeToVisit}` : null,
          record.location ? `Location: ${record.location}` : null,
        ].filter(Boolean);
        schoolForm.setValue('followUpNotes', followUpParts.join('. '));
      }
    }
  }, [plannedIntell, selectedIntellId, schoolForm]);

  const handleImportIntell = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedIntellId(id || null);
    
    if (id) {
      const record = plannedIntell.find(r => r.id === id);
      if (record) {
        schoolForm.setValue('name', record.name);
        schoolForm.setValue('notes', record.intell || '');
        const followUpParts = [
          record.source ? `Source: ${record.source}` : null,
          record.bestTimeToVisit ? `Best time to visit: ${record.bestTimeToVisit}` : null,
          record.location ? `Location: ${record.location}` : null,
        ].filter(Boolean);
        schoolForm.setValue('followUpNotes', followUpParts.join('. '));
      }
    } else {
      schoolForm.reset({ name: '', notes: '', followUpDate: '', followUpNotes: '', status: 'VISITED' });
    }
  };

  const createSchool = useMutation({
    mutationFn: async (data: SchoolForm) => {
      const payload = {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
      };
      const res = await api.post('/schools', payload);
      const school = res.data;
      
      // If imported from intelligence, update intelligence status and link school
      if (selectedIntellId) {
        await api.patch(`/intelligence/${selectedIntellId}`, { status: 'VISITED', schoolId: school.id });
      }
      return school;
    },
    onSuccess: async (school) => {
      for (const contact of contacts) {
        await api.post('/contacts', { ...contact, schoolId: school.id });
      }
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
      setSuccess(true);
      setTimeout(() => navigate('/schools'), 1200);
    },
  });

  const addContact = (data: ContactForm) => {
    if (data.isPrimary) {
      setContacts(prev => prev.map(c => ({ ...c, isPrimary: false })));
    }
    setContacts(prev => [...prev, data]);
    contactForm.reset();
    setShowContactForm(false);
  };

  const removeContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="text-center py-20 animate-page">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">School added!</h3>
        <p className="mt-1 text-sm text-muted-foreground">Redirecting to list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Import from Intelligence */}
      {plannedIntell.length > 0 && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <Import className="w-4 h-4" />
            Import from Intelligence
          </label>
          <select
            value={selectedIntellId || ''}
            onChange={handleImportIntell}
            className="w-full h-11 px-4 rounded-xl border border-primary/30 bg-card text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">-- Do not import, start blank --</option>
            {plannedIntell.map(record => (
              <option key={record.id} value={record.id}>
                {record.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Select an intelligence record to auto-fill the form and mark it as visited.
          </p>
        </div>
      )}

      {/* School Info */}
      <form
        id="school-form"
        onSubmit={schoolForm.handleSubmit((data) => createSchool.mutate(data))}
        className="space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">School Name</label>
          <input
            {...schoolForm.register('name')}
            placeholder="e.g. Bristar Academy"
            className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm
                       placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       transition-all"
          />
          {schoolForm.formState.errors.name && (
            <p className="text-xs text-destructive mt-1">{schoolForm.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
          <textarea
            {...schoolForm.register('notes')}
            rows={3}
            placeholder="Initial response, follow-up date, etc."
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm
                       placeholder:text-muted-foreground resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Follow-up Date</label>
            <input
              type="date"
              {...schoolForm.register('followUpDate')}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              {...schoolForm.register('status')}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all"
            >
              <option value="VISITED">Visited</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="BOOKED">Booked</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Follow-up Notes</label>
          <textarea
            {...schoolForm.register('followUpNotes')}
            rows={2}
            placeholder="Next action, promised callback, requirements, etc."
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm
                       placeholder:text-muted-foreground resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       transition-all"
          />
        </div>
      </form>

      {/* Contacts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Contacts</h3>
          <button
            type="button"
            onClick={() => setShowContactForm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add contact
          </button>
        </div>

        {contacts.length === 0 && !showContactForm && (
          <p className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-border">
            No contacts added yet. Add people you met during the visit.
          </p>
        )}

        {/* Contact list */}
        <div className="space-y-2">
          {contacts.map((contact, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">{contact.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{contact.name}</span>
                  {contact.isPrimary && (
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                      PRIMARY
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{contact.role} - {contact.phone}</p>
                {contact.notes && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeContact(i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                           hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add contact form */}
        {showContactForm && (
          <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Name</label>
                <input
                  {...contactForm.register('name')}
                  placeholder="e.g. Mrs Njeri"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Role</label>
                <input
                  {...contactForm.register('role')}
                  placeholder="e.g. Headteacher"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
              <input
                {...contactForm.register('phone')}
                placeholder="e.g. 0712 xxx xxx"
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
              <textarea
                {...contactForm.register('notes')}
                rows={2}
                placeholder="Response, relationship, preferred follow-up, etc."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground
                           placeholder:text-muted-foreground resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...contactForm.register('isPrimary')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span className="text-xs font-medium text-foreground">Primary follow-up contact</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={contactForm.handleSubmit(addContact)}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg
                           hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { contactForm.reset(); setShowContactForm(false); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                           rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <p className="text-xs text-center text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Visit date and time will be automatically recorded as today.
        </p>
        <button
          type="submit"
          form="school-form"
          disabled={createSchool.isPending}
          className="w-full h-12 bg-primary text-primary-foreground text-sm font-semibold rounded-xl
                     hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2"
        >
          {createSchool.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save School'
          )}
        </button>
      </div>
    </div>
  );
}
