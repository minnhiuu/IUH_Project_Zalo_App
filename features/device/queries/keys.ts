export const deviceKeys = {
  all: ['devices'] as const,
  myDevices: () => [...deviceKeys.all, 'my'] as const
}
