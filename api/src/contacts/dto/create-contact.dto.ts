export class CreateContactDto {
  name: string;
  role: string;
  phone: string;
  isPrimary?: boolean;
  schoolId: string;
}
