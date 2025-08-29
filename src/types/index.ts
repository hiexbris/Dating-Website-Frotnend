export interface User {
  id: string;
  name: string;
  description: string;
  photo: string;
  age?: number;
}

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
}
