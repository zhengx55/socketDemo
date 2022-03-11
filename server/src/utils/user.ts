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
  const existing = users.find((user: User) => {
    return user.user_id === user_id;
  });
  if (!existing) {
    users.push(user);
  } else {
    // if remove has bug then update the user's socket_id
    users.map((item: User) => {
      if (user.user_id === item.user_id && user.token === item.token) {
        item.socket_id = user.socket_id;
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
  return users.find((user) => user.user_id === id);
};
