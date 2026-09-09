import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';
import api from '../lib/api';


const intellSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  source: z.string().min(1, 'Source is required'),
  intell: z.string().min(1, 'Intelligence details are required'),
  bestTimeToVisit: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  estimatedStudents: z.string().optional(),
  schoolType: z.string().optional(),
  hasSystem: z.string().optional(),
  plannedVisitDate: z.string().optional(),
});

type IntellForm = z.infer<typeof intellSchema>;

export default function IntelligenceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ['intelligence', id],
    queryFn: () => api.get(`/intelligence/${id}`).then(r => r.data),
  });

  const form = useForm<IntellForm>({
    resolver: zodResolver(intellSchema),
    defaultValues: {
      name: '', source: '', intell: '', bestTimeToVisit: '', location: '',
      estimatedStudents: '', schoolType: 'Private', hasSystem: 'Unknown', plannedVisitDate: ''
    },
  });

  useEffect(() => {
    if (record) {
      form.reset({
        name: record.name,
        source: record.source,
        intell: record.intell,
        bestTimeToVisit: record.bestTimeToVisit,
        location: record.location,
        estimatedStudents: record.estimatedStudents || '',
        schoolType: record.schoolType || 'Private',
        hasSystem: record.hasSystem || 'Unknown',
        plannedVisitDate: record.plannedVisitDate ? record.plannedVisitDate.split('T')[0] : '',
      });
    }
  }, [record, form]);

  const updateIntell = useMutation({
    mutationFn: async (data: IntellForm) => {
      const payload = {
        ...data,
        plannedVisitDate: data.plannedVisitDate ? new Date(data.plannedVisitDate).toISOString() : null
      };
      const res = await fetch(`${API}/intelligence/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
      setSuccess(true);
      setTimeout(() => navigate(-1), 1200);
    },
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading...</div>;
  }

  if (success) {
    return (
      <div className="text-center py-20 animate-page">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Record updated!</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mt-0.5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Edit Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">Update prospect details and schedule.</p>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => updateIntell.mutate(data))}
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
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm resize-none
                       focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Est. Students</label>
            <input
              {...form.register('estimatedStudents')}
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
              <option value="Unknown">Unknown</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Best time to visit</label>
            <input
              {...form.register('bestTimeToVisit')}
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
        </div>

        <div className="pt-2">
          <p className="text-xs text-center text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Date and time will be automatically recorded as today.
          </p>
          <button
            type="submit"
            disabled={updateIntell.isPending}
            className="w-full h-12 bg-primary text-primary-foreground text-sm font-semibold rounded-xl
                       hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {updateIntell.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
