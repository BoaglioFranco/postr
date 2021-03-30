import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PWD_PREFIX } from "../constants";
import { UserInputType } from "./UserInputType";
import { FieldError } from "./FieldError";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {

  @FieldResolver()
  email(@Root() root: User, @Ctx() { req }: MyContext){
    if(root.id === req.session.userId){
      return root.email;
    }
    return "";
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [{ field: "password", message: "Password is too short!" }],
      };
    }
    //Redis token stores the userId
    const key = FORGOT_PWD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{ field: "token", message: "Token expired" }],
      };
    }
    const userIdINT = parseInt(userId);
    const user = await User.findOne(userIdINT);
    if (!user) {
      return {
        errors: [{ field: "user", message: "User no longer exists" }],
      };
    }
    const hashedNewPassword = await argon2.hash(newPassword);
    await User.update({ id: userIdINT }, { password: hashedNewPassword });

    await redis.del(key);
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();

    redis.set(FORGOT_PWD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24);

    sendEmail({
      to: email,
      html: `<a href='http://localhost:3000/change-password/${token}'>Change your password</a>`,
    });

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInputType
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      user = await User.create({
        username: options.username,
        password: hashedPassword,
        email: options.email,
      }).save();
    } catch (err) {
      if (err.code == "23505") {
        return {
          errors: [{ field: "username", message: "username already exists." }],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const userTofind = usernameOrEmail.includes("@")
      ? { where: { email: usernameOrEmail } }
      : { where: { username: usernameOrEmail } };

    const user = await User.findOne(userTofind);
    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "user doesnt exist" }],
      };
    }
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [{ field: "password", message: "incorrect password!" }],
      };
    }
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
