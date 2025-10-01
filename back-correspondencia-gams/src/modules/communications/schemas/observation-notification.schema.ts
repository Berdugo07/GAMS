import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({ collection: 'observation_notifications', timestamps: true })
export class ObservationNotification extends Document {

    @Prop({ type: String, required: true })   
    procedureCode: string;


  @Prop({ type: String, required: true })
  observation: string;

  @Prop({ default: 'sent' })
  status: string;

  @Prop()
  phone?: string;

  @Prop()
  applicantName?: string;
}

export const ObservationNotificationSchema =
  SchemaFactory.createForClass(ObservationNotification);
