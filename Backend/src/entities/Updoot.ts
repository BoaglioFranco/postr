import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

//This class is both a typeorm entity and a type-graphql type, You can stack decorators
// @Entity(), @Primarycol, @Createdate, @updatedate, @column from typeorm
//ObjectType(), Field() Graphql

@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: "int" })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;
  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.updoots, {onDelete: 'CASCADE'})
  post: Post;
}
