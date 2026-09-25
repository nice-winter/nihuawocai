import { z } from 'zod'

// Room create schema
export const roomCreateSchema = z.object({
  type: z.literal('room:create'),
  openSeatCount: z.number().int().min(1).max(6),
  options: z.object({
    password: z.string().max(16),
    maxOnlookers: z.number().int().min(0)
  })
})

// Room join schema
export const roomJoinSchema = z.object({
  type: z.literal('room:join'),
  roomNumber: z.number().int().min(0).max(999),
  /** 可选：邀请/广播携带的房间身份 ID，服务端校验与 roomNumber 对应 */
  roomId: z.string().optional(),
  password: z.string().optional().nullable(),
  look: z.boolean().optional()
})

// Room sit schema
export const roomSitSchema = z.object({
  seat: z.number().int().min(0).max(6)
})

// Room seat switch schema
export const roomSeatOpenChangeSchema = z.object({
  seat: z.number().int().min(0).max(6),
  isOpen: z.boolean()
})

// Room password change schema
export const roomPasswordChangeSchema = z.object({
  password: z.string().max(16)
})

// Room invite schema
export const roomInviteSchema = z.object({
  /** 被邀请玩家 ID */
  targetId: z.string()
})

// Type exports for TypeScript
export type RoomCreate = z.infer<typeof roomCreateSchema>
export type RoomJoin = z.infer<typeof roomJoinSchema>
export type RoomSit = z.infer<typeof roomSitSchema>
export type RoomSeatOpenChange = z.infer<typeof roomSeatOpenChangeSchema>
export type RoomPasswordChange = z.infer<typeof roomPasswordChangeSchema>
export type RoomInvite = z.infer<typeof roomInviteSchema>
