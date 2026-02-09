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

