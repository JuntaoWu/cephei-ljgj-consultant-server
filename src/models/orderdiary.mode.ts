import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export enum OrderDiaryType {
    ContactUser = 1,
    VisitUser = 2,
    Preparing = 3,
    InProgress = 3,
    Completed = 4,
    Canceled = 5,
    Other = 6
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
    public orderDiaryType:   OrderDiaryType;
    
    @prop()
    public diaryPicUrls?: Array<String>;
  }
  
  var OrderDiaryModel = new OrderDiary().getModelForClass(OrderDiary, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default OrderDiaryModel;
  