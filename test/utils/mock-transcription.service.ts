export interface MockTranscriptionService {
  transcribe: jest.Mock;
}

export function createMockTranscriptionService(): MockTranscriptionService {
  return {
    transcribe: jest.fn().mockResolvedValue(null),
  };
}
