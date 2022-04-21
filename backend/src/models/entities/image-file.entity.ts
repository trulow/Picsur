import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ImageFileType } from '../constants/image-file-types.const';

@Entity()
@Unique(['imageId', 'type'])
export class EImageFileBackend {
  @PrimaryGeneratedColumn('uuid')
  private _id?: string;

  @Index()
  @Column({ nullable: false })
  imageId: string;

  @Index()
  @Column({ nullable: false, enum: ImageFileType })
  type: ImageFileType;

  @Column({ nullable: false })
  mime: string;

  // Binary data
  @Column({ type: 'bytea', nullable: false })
  data: Buffer;
}
