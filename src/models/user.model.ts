import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID, Int32 } from 'bson';

/**
 * User Schema
 */
export class User extends Typegoose {

  @prop()
  public phoneNo?: Int32;

  @prop()
  public username?: String;

  @prop()
  public nickname?: String;
  
  @prop()
  public password?: String;

  @prop()
  public gender?: Number;

  @prop()
  public avatarUrl?: String;

  @prop()
  public securityStamp?: String;

}

const UserModel = new User().getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  }
});

export default UserModel;