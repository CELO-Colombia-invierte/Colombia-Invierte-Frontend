import { apiService } from '../api/api.service';
import { User } from '@/models/User.model';
import { UserDto } from '@/dtos/auth/AuthResponse.dto';

class UsersService {
  private mapUserDtoToUser(dto: UserDto): User {
    const avatar = dto.avatar_asset?.url || dto.avatar;

    return new User({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      displayName: dto.display_name,
      avatar: avatar,
      avatarAssetId: dto.avatar_asset_id,
      verified: dto.is_verified ?? dto.verified ?? false,
      phone: dto.phone,
      phoneCountryCode: dto.phone_country_code,
      dateOfBirth: dto.date_of_birth,
      gender: dto.gender,
      investmentExperience: dto.investment_experience,
      employmentStatus: dto.employment_status,
      investmentExpertise: dto.investment_expertise,
      investmentTimeline: dto.investment_timeline,
      riskTolerance: dto.risk_tolerance,
      favoriteCategories: dto.favorite_categories,
      activeInterests: dto.active_interests,
      createdAt: dto.created_at ? new Date(dto.created_at) : new Date(),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : new Date(),
    });
  }

  async getUserByUsername(username: string): Promise<User> {
    const response = await apiService.get<UserDto>(`/users/username/${username}`);
    return this.mapUserDtoToUser(response.data);
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiService.get<UserDto>(`/users/${id}`);
    return this.mapUserDtoToUser(response.data);
  }
}

export const usersService = new UsersService();

