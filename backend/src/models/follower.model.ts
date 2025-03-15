import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './user.model';
import { Vacation } from './vacation.model';

@Table({
  tableName: 'followers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'vacationId']
    }
  ]
})
export class Follower extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  userId!: string;

  @ForeignKey(() => Vacation)
  @Column({
    type: DataType.UUID
  })
  vacationId!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Vacation)
  vacation!: Vacation;
}