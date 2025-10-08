import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'observation_notifications', timestamps: true })
export class ObservationNotification extends Document {

    @Prop({ type: String, required: true })   
    procedureCode: string;

    @Prop({ type: String, required: true })
    observation: string;

    @Prop({ 
        type: String, 
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent' 
    })
    status: string;

    @Prop()
    phone?: string;

    @Prop()
    applicantName?: string;

    @Prop()
    messageId?: string;

    @Prop()
    statusTimestamp?: Date;

    @Prop({ type: Object })
    errorDetails?: {
        code?: string;
        title?: string;
        message?: string;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ObservationNotificationSchema =
  SchemaFactory.createForClass(ObservationNotification);