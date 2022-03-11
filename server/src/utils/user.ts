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
  const { user_id } = user;
  console.log(`添加玩家${user_id}成功, 玩家socket-id为: ${user.socket_id}`);
  const existing = users.find((user: User) => {
    return user.user_id === user_id;
  });
  if (!existing) {
    users.push(user);
  }
};

/**
 * Remove user when disconnect with socket_id
 * @param id
 * @returns
 */
export const removeUser = (id: string): void => {
  console.log(`玩家已被移除, 玩家socket-id: ${id}`);
  const index = users.findIndex((user) => user.socket_id === id);
  if (index !== -1) {
    users.splice(index, 1)[0];
  }
};

/**
 * Return specific user
 * @param id
 * @returns
 */
export const getUser = (id: string): User => {
  return users.find((user) => user.socket_id === id);
};

export const getUserbyUserid = (id: number): User => {
  console.log("当前玩家:", users);
  return users.find((user) => user.user_id === id);
};
