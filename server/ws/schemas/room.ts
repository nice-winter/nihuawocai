import { z } from 'zod'

// Room create schema
export const roomCreateSchema = z.object({
  type: z.literal('room:create'),
  opens: z.number().int().min(1).max(6),
  options: z.object({
    password: z.string().max(16),
    maxOnlookers: z.number().int().min(0)
  })
})

// Room join schema
export const roomJoinSchema = z.object({
  type: z.literal('room:join'),
  roomNumber: z.number().int().min(0).max(999),
  password: z.string().optional().nullable(),
  look: z.boolean().optional()
})

// Room sit schema
export const roomSitSchema = z.object({
  seat: z.number().int().min(0).max(6)
})

// Room seat switch schema
export const roomSeatSwitchSchema = z.object({
  roomNumber: z.number().int().min(0),
  seat: z.number().int().min(0).max(6),
  open: z.boolean()
})

// Room password change schema
export const roomPasswordChangeSchema = z.object({
  roomNumber: z.number().int().min(0),
  password: z.string().max(16)
})

// Room invite schema
export const roomInviteSchema = z.object({
  toId: z.string()
})

// Type exports for TypeScript
export type RoomCreate = z.infer<typeof roomCreateSchema>
export type RoomJoin = z.infer<typeof roomJoinSchema>
export type RoomSit = z.infer<typeof roomSitSchema>
export type RoomSeatSwitch = z.infer<typeof roomSeatSwitchSchema>
export type RoomPasswordChange = z.infer<typeof roomPasswordChangeSchema>
export type RoomInvite = z.infer<typeof roomInviteSchema>
