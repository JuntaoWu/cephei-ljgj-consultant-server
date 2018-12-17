
import { prop, Typegoose, ModelType, InstanceType, pre } from 'typegoose';

import * as _ from 'lodash';


export enum OrderStatus {
    Initializing = 1,
    Preparing = 2,
    InProgress = 3,
    Completed = 4,
    Canceled = 5,
  }

/**
 * Order Schema
 */
export class Order extends Typegoose {
    @prop()
    orderId: String;
    @prop()
    assignee: String;  // 订单处理人
    @prop()
    orderStatus: OrderStatus;
}

const OrderModel = new Order().getModelForClass(Order, {
    schemaOptions: {
        timestamps: true
    }
});

export default OrderModel;
