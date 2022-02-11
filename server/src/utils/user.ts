interface User {
  socket_id: string;
  user_id: string;
  room: string;
}
const users: User[] = [];

const addUser = (user: User): User => {
  const { socket_id, user_id, room } = user;
  const existing = users.find((user: User) => {
    return user.room === room && user.user_id === user_id;
  });
  if (!existing) {
    users.push(user);
  }
  return user;
};

module.exports = {
  addUser,
};
