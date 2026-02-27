export interface UserDto {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  avatar_asset_id?: string;
  avatar_asset?: {
    id: string;
    url: string;
  };
  is_verified?: boolean;
  verified?: boolean;
  phone?: string;
  phone_country_code?: string;
  date_of_birth?: string;
  gender?: string;
  investment_experience?: string;
  employment_status?: string;
  investment_expertise?: string;
  investment_timeline?: string;
  risk_tolerance?: string;
  favorite_categories?: string[];
  active_interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface CompleteProfileDto {
  display_name: string;
  username: string;
  email: string;
}

export interface AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface ThirdwebVerifyRequestDto {
  wallet_address: string;
  thirdweb_user_id: string;
  chain_id: number;
  email?: string;
  display_name?: string;
}

export interface UpdateUserRequestDto {
  email?: string;
  username?: string;
  display_name?: string;
  avatar_asset_id?: string;
  phone?: string;
  phone_country_code?: string;
  date_of_birth?: string;
  gender?: string;
  investment_experience?: string;
  employment_status?: string;
  investment_expertise?: string;
  investment_timeline?: string;
  risk_tolerance?: string;
  favorite_categories?: string[];
  active_interests?: string[];
}
