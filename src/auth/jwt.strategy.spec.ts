import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('maps a JWT payload to the request user shape', () => {
    const config = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);

    const result = strategy.validate({
      sub: 'user-1',
      email: 'jane@example.com',
    });

    expect(result).toEqual({ userId: 'user-1', email: 'jane@example.com' });
  });
});
