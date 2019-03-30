import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export enum OrderDiaryType {
    ConfirmOrder = 0,
    ContactUser = 1,
    VisitUser = 2,
    Reviewed = 3,
    Preparing = 4,
    InProgress = 5,
    Completed = 6,
    Canceled = 7,
    Others = 8
}

/**
 * Post Schema
 */
export class OrderDiary extends Typegoose {

    @prop()
    public orderDiaryId: String;

    @prop()
    public orderId: String;

    @prop()
    public orderDiaryTheme: String;

    @prop()
    public orderDiaryContent: String;

    @prop()
    public orderDiaryType: OrderDiaryType;

    @prop()
    public diaryPicUrls?: Array<String>;

    @prop()
    public createdBy?: String;
}

var OrderDiaryModel = new OrderDiary().getModelForClass(OrderDiary, {
    schemaOptions: {
        timestamps: true,
    }
});

export default OrderDiaryModel;
