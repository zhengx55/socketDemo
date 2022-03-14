interface User {
  socket_id: string;
  user_id: number;
  token: string;
}
const users: User[] = [];

/**
 * Add user to array when successfully logged into the game lobby
 * @param user
 * @returns
 */
export const addUser = (user: User): void => {
  const { user_id, socket_id, token } = user;
  const existing = users.find((user: User) => {
    return user.user_id === user_id || user.socket_id === socket_id;
  });

  if (!existing) {
    users.push(user);
    console.log(`添加玩家 ${user_id} 成功, 玩家socket-id: ${user.socket_id}`);
    console.log('------------------------------------------')
  } else if (existing) {
    console.log(
      `发现未清除用户 user_id:${user_id} socket_id: ${socket_id}, 更新用户信息`
    );
    console.log('------------------------------------------')
    users.forEach((user) => {
      if (user.socket_id === socket_id && user.user_id !== user_id) {
        user.user_id = user_id;
        user.token = token;
      }
    });
  }
};

/**
 * Remove user when disconnect with socket_id
 * @param id
 * @returns
 */
export const removeUser = (id: string): void => {
  const index = users.findIndex((user) => user.socket_id === id);
  if (index !== -1) {
    console.log(`玩家已被移除, 玩家socket-id: ${id}`);
    console.log('------------------------------------------')
    users.splice(index, 1)[0];
  }
};

/**
 * Return specific user with socket_id
 * @param id
 * @returns
 */
export const getUser = (id: string): User => {
  return users.find((user) => user.socket_id === id);
};

/**
 * Return specific user with user_id
 * @param id
 * @returns
 */
export const getUserbyUserid = (id: number): User => {
  console.log("当前在线玩家列表:", users);
  return users.find((user) => user.user_id === id);
};
