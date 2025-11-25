export interface WsProcotol {
  room: {
    create: {
      type: 'room:create'
      opens: number
      options: { password: string; maxOnlookers: number }
    }

    join: {
      type: 'room:join'
      roomNumber: number
      password: string
      look?: boolean
    }

    sit: {
      seat: number
    }

    sitSwitch: {
      roomNumber: number
      seat: number
      open: boolean
    }

    passwordChange: {
      roomNumber: number
      password: string
    }

    invite: {
      toId: string
    }
  }
}
