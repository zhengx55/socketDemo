export interface Room {
  playerList: {
    [key: string]: {
      user_id: string;
      initial_hp: string;
      hp: string;
      attack: string;
      armor: string;
      type: string;
    };
  };
  room_now_current_user: string;
  room_id: string;
  room_type: string;
  room_status: string;
  room_battle_logs: any[];
  room_battle_reward: any[];
  room_start_time: string;
  room_end_time: string;
  command: string;
  hash: string;
}

let Rooms: Room[] = [];

export const Addroom = (room: Room): void => {
  const existing = Rooms.find((item: Room) => {
    return item.room_id === room.room_id;
  });
  if (existing) {
    return;
  }
  Rooms.push(room);
};

export const getRoom = (user_id: string): Room | null => {
  const matchInfo = Rooms.find((item: Room) => {
    if (item.playerList.hasOwnProperty(user_id)) {
      return item;
    }
  });
  if (matchInfo) {
    return matchInfo;
  } else {
    return null;
  }
};

export const removeRoom = (room_id: string): Room => {
  const index = Rooms.findIndex((room) => room.room_id === room_id);
  if (index !== -1) {
    return Rooms.splice(index, 1)[0];
  }
};
