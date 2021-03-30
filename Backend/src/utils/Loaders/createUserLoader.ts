import DataLoader from 'dataloader';
import { User } from '../../entities/User';


export const createUserLoader = () => new DataLoader<number, User>(async userIds =>{
    const users = User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    (await users).forEach((user)=>{
        userIdToUser[user.id] = user;
    });

    return userIds.map((userId) => userIdToUser[userId]);
})