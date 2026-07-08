export interface MockS3Service {
  uploadAudio: jest.Mock;
  getPlaybackUrl: jest.Mock;
  deleteAudio: jest.Mock;
}

export function createMockS3Service(): MockS3Service {
  return {
    uploadAudio: jest
      .fn()
      .mockResolvedValue('recordings/test-user/mock-recording.webm'),
    getPlaybackUrl: jest
      .fn()
      .mockResolvedValue('https://mock-s3.test/playback-url'),
    deleteAudio: jest.fn().mockResolvedValue(undefined),
  };
}
