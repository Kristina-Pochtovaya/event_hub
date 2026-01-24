export const createQueueMock = () => ({
  add: jest.fn().mockResolvedValue({ id: 'job-id' }),
});

export class BullExplorerMock {
  onModuleInit() {}
}
