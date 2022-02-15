interface User {
  socket_id: string;
  user_id: string;
}
const users: User[] = [];

/**
 * Add user to array when successfully logged into the game lobby
 * @param user
 * @returns
 */
export const addUser = (user: User): boolean => {
  const { user_id } = user;
  const existing = users.find((user: User) => {
    return user.user_id === user_id;
  });
  if (existing) {
    return false;
  }
  users.push(user);
  return true;
};

/**
 * Remove user when disconnect
 * @param id
 * @returns
 */
export const removeUser = (id: string) => {
  const index = users.findIndex((user) => user.socket_id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

/**
 * Return specific user
 * @param id
 * @returns
 */
export const getUser = (id: string): User => {
  return users.find((user) => user.user_id === id);
};
