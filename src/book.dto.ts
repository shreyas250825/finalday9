import { Expose } from 'class-transformer';

export class BookDTO {
  @Expose()
  id!: number;

  @Expose()
  title!: string;

  @Expose()
  author!: string;

  @Expose()
  year!: number;

  @Expose()
  isbn!: string;
}