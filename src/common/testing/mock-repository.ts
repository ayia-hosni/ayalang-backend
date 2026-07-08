import { Repository } from 'typeorm';

export type MockRepository<T extends object = any> = {
  [K in keyof Repository<T>]?: jest.Mock;
};

export function createMockRepository<
  T extends object = any,
>(): MockRepository<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    count: jest.fn(),
  };
}
