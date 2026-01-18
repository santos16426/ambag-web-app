export type UserType = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  iss: string;
  name: string;
  picture: string | null;
  provider_id: string;
  sub: string;
};

export type UserSearchResult = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};