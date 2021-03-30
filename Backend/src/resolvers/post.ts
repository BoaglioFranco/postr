import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

//When declaring queries i need to define both the graphql type and the typescript function return type
@Resolver(Post)
export class PostResolver {
  //
  //
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() root: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(root.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() root: Post,
    @Ctx() { req, updootLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      userId: req.session.userId,
      postId: root.id,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const realValue = value !== -1 ? 1 : -1;
    const userId = req.session.userId;
    const updoot = await Updoot.findOne({ where: { postId, userId } });
    if (updoot) {
      if (updoot.value !== realValue) {
        //change vote on already voted post
        await getConnection().transaction(async (tm) => {
          await tm.query(
            ` UPDATE updoot 
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3 ;`,
            [realValue, postId, userId]
          );

          await tm.query(
            ` UPDATE post
          SET points = points + $1
          WHERE id = $2;`,
            [realValue * 2, postId]
          );
        });
      }
    } else {
      //hasnt voted yet
      await getConnection().transaction(async (tm) => {
        await tm.query(
          ` INSERT INTO updoot ("postId", "userId", value)
        VALUES($1, $2, $3);`,
          [postId, userId, realValue]
        );

        await tm.query(
          ` UPDATE post
        SET points = points + $1
        WHERE id = $2;`,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int, { nullable: true }) limit: number | null,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const amount = limit ? Math.min(limit, 50) : 10;
    const amountPlusOne = amount + 1;

    const replacements: any[] = [amountPlusOne];

    if (cursor) {
      replacements.push(new Date(+cursor));
    }

    let posts = await getConnection().query(
      `
    SELECT p.*
    FROM post p
    ${cursor ? `WHERE p."createdAt" < $2 ` : ""}
    ORDER BY p."createdAt" DESC
    LIMIT $1 ;
    `,
      replacements
    );

    return {
      posts: posts.slice(0, amount),
      hasMore: posts.length === amountPlusOne ? true : false,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const creatorId = req.session.userId;

    return Post.create({ ...input, creatorId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id AND "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
