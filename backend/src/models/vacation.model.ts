import { Table, Column, Model, DataType, HasMany, BeforeDestroy } from 'sequelize-typescript';
import { Follower } from './follower.model';
import { S3Service } from '../services/s3.service';

@Table({
  tableName: 'vacations',
  timestamps: true
})
export class Vacation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  destination!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  description!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  endDate!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 10000
    }
  })
  price!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  imageFileName!: string;

  @HasMany(() => Follower)
  followers!: Follower[];

  // Virtual fields
  get imageUrl(): string {
    const s3Service = new S3Service();
    return s3Service.getImageUrl(this.imageFileName);
  }

  get isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  get isUpcoming(): boolean {
    const now = new Date();
    return now < this.startDate;
  }

  // Hooks
  @BeforeDestroy
  static async deleteImage(instance: Vacation) {
    const s3Service = new S3Service();
    await s3Service.deleteFile(instance.imageFileName);
  }

  // Add image URL to JSON output
  toJSON() {
    const values = { ...this.get() };
    values.imageUrl = this.imageUrl;
    return values;
  }
}