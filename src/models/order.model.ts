
import { prop, Typegoose, ModelType, InstanceType, pre } from 'typegoose';
import { Int32 } from 'bson';
import * as _ from 'lodash';


export enum OrderStatus {
    Initializing = 1,
    Preparing = 2,
    InProgress = 3,
    Completed = 4,
    Canceled = 5,
    Other = -1
  }


  export enum OrderPaymentStatus {
    Initializing = 1,
    Waiting = 2,
    Completed = 3,
    Closed = 4,
    Exception = 5,
  }

  
/**
 * Order Schema
 */
export class Order extends Typegoose {
   
  @prop({ unique: true })
  public orderId: String;

  @prop()
  public contactsUserName: String;

  @prop()
  public phoneNo: Int32;

  @prop()
  public isGroupOrder: boolean;

  @prop()
  public orderContent: String;

  @prop()
  public groupContent: String;

  @prop()
  public orderAddress: String;

  @prop()
  public gServiceItemid: String;

  @prop()
  public houseName: String;

  @prop()
  public orderDescription: String;

  @prop()
  public orderThumbUrl: String;

  @prop()
  public orderTime: String;

  @prop()
  public orderStatus: OrderStatus;

  @prop()
  public orderAmount: Number;

  @prop()
  public preAmount: Number;

  @prop()
  public paidAmount: Number;

  @prop()
  public craftsman: String;

  @prop()
  public assignee: String;

  @prop()
  public projectid: String;

  @prop({ default: OrderPaymentStatus.Waiting })
  public paymentStatus?: OrderPaymentStatus;

  @prop()
  public createdBy: String;

}

const OrderModel = new Order().getModelForClass(Order, {
    schemaOptions: {
        timestamps: true
    }
});

export default OrderModel;
