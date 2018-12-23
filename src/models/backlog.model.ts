
import { prop, Typegoose, ModelType, InstanceType, pre } from 'typegoose';
import { Int32 } from 'bson';
import * as _ from 'lodash';

export enum BacklogType {
    ConfirmOrder,  // 客服审核确认
    ContactUser,   // 联系用户
    VisitUser,      //上门查看
    Preparing,     // 准备施工
    InProgress,    // 正在施工
    Completed,     // 施工完成
    Canceled,      // 终止服务
    Others,        // 其他
}

/**
 * Backlog Schema
 */
export class Backlog extends Typegoose {

    @prop({ index: true, required: true })
    public orderId: String;

    @prop({ required: true })
    public backlogType: BacklogType;

    @prop()
    public backlogContent: String;

    @prop()
    public imageUrls: Array<String>;

    @prop()
    public createdBy: String;

}

const BacklogModel = new Backlog().getModelForClass(Backlog, {
    schemaOptions: {
        timestamps: true
    }
});

export default BacklogModel;
