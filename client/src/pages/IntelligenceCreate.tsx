import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';
import api from '../lib/api';
import { useCampaign } from '../lib/CampaignContext';

const intellSchema = z.object({
  name: z.string().trim().min(1, 'School name is required'),
  source: z.string().optional(),
  intell: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  location: z.string().optional(),
  estimatedStudents: z.string().optional(),
  schoolType: z.string().optional(),
  hasSystem: z.string().optional(),
  plannedVisitDate: z.string().optional(), // HTML date string
});

type IntellForm = z.infer<typeof intellSchema>;

function nullableString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export default function IntelligenceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { campaignId } = useCampaign();
  const [success, setSuccess] = useState(false);

  const form = useForm<IntellForm>({
    resolver: zodResolver(intellSchema),
    defaultValues: {
      name: '', source: '', intell: '', bestTimeToVisit: '', location: '',
      estimatedStudents: '', schoolType: '', hasSystem: '', plannedVisitDate: ''
    },
  });

  const createIntell = useMutation({
    mutationFn: async (data: IntellForm) => {
      const payload = {
        name: data.name.trim(),
        source: nullableString(data.source),
        intell: nullableString(data.intell),
        bestTimeToVisit: nullableString(data.bestTimeToVisit),
        location: nullableString(data.location),
        estimatedStudents: nullableString(data.estimatedStudents),
        schoolType: nullableString(data.schoolType),
        hasSystem: nullableString(data.hasSystem),
        ...(campaignId ? { campaignId } : {}),
        plannedVisitDate: data.plannedVisitDate ? new Date(data.plannedVisitDate).toISOString() : null
      };
      const { data: result } = await api.post('/intelligence', payload);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence', { campaignId }] });
      setSuccess(true);
      setTimeout(() => navigate(campaignId ? `/campaigns/${campaignId}/intelligence` : '/intelligence'), 1200);
    },
  });

  if (success) {
    return (
      <div className="text-center py-20 animate-page">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Record added!</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">New Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-1">Add a prospective school to your pipeline.</p>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => createIntell.mutate(data))}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">School Name</label>
          <input
            {...form.register('name')}
            className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                       focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Source</label>
            <input
              {...form.register('source')}
              placeholder="e.g. Referral, Facebook"
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <input
              {...form.register('location')}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Intelligence Details</label>
          <textarea
            {...form.register('intell')}
            rows={3}
            placeholder="What do we know about them?"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm resize-none
                       focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Est. Students</label>
            <input
              {...form.register('estimatedStudents')}
              placeholder="e.g. 500+"
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">School Type</label>
            <select
              {...form.register('schoolType')}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Not specified</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Already has a system?</label>
            <select
              {...form.register('hasSystem')}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Not specified</option>
              <option value="Unknown">Unknown</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Best time to visit</label>
            <input
              {...form.register('bestTimeToVisit')}
              placeholder="e.g. Wed 10am"
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <label className="block text-sm font-bold text-primary mb-1.5">Plan Visit Date (Optional)</label>
          <input
            type="date"
            {...form.register('plannedVisitDate')}
            className="w-full h-11 px-4 rounded-xl border border-primary/30 bg-primary/5 text-sm
                       focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1">Set a date to schedule this prospect in your calendar.</p>
        </div>

        <div className="pt-2">
          <p className="text-xs text-center text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Date and time will be automatically recorded as today.
          </p>
          <button
            type="submit"
            disabled={createIntell.isPending}
            className="w-full h-12 bg-primary text-primary-foreground text-sm font-semibold rounded-xl
                       hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {createIntell.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
