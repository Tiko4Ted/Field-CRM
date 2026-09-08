export class CreateIntelligenceDto {
  name: string;
  source: string;
  intell: string;
  bestTimeToVisit: string;
  location: string;
  estimatedStudents?: string;
  schoolType?: string;
  hasSystem?: string;
  plannedVisitDate?: Date | string;
  status?: string;
  schoolId?: string;
}
