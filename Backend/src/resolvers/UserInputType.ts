import {
  Field,
  InputType
} from "type-graphql";


@InputType()
export class UserInputType {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
