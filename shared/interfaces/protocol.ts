export interface WsProcotolRoomCreate {
  type: 'room:create'
}

export interface WsProcotolRoomJoin {
  type: 'room:join'
  roomNumber: number
}
