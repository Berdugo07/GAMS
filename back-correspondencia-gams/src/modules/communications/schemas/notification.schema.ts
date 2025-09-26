import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'notifications' })
export class Notification extends Document {
  @Prop({ type: [String], required: true })
  ids: string[];

  @Prop({ type: String, required: true })
  observation: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
