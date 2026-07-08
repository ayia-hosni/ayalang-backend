export interface AuthResponseBody {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    totalXP: number;
  };
}

export interface RecordingResponseBody {
  id: string;
  duration: number;
  createdAt: string;
  subQuestionId: string | null;
  playbackUrl: string;
  totalXP: number;
}
