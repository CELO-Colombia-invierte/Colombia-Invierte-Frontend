import { User } from '@/models/User.model';
import {
  UserDto,
  AuthResponseDto,
  UpdateUserRequestDto
} from '@/dtos/auth/AuthResponse.dto';

/**
 * UserMapper - Transforma entre DTOs del API y Models del dominio
 */
export class UserMapper {
  /**
   * Convierte un UserDto del API a un User Model
   */
  static fromDto(dto: UserDto): User {
    return new User({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      displayName: dto.display_name,
      avatar: dto.avatar,
      avatarAssetId: dto.avatar_asset_id,
      verified: dto.verified ?? false,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }

  /**
   * Convierte el usuario de un AuthResponse a un User Model
   */
  static fromAuthResponse(dto: AuthResponseDto): User {
    return this.fromDto(dto.user);
  }

  /**
   * Convierte un User Model a un UpdateUserRequestDto
   */
  static toUpdateRequest(user: User): UpdateUserRequestDto {
    return {
      email: user.email,
      username: user.username,
      display_name: user.displayName,
      avatar_asset_id: user.avatarAssetId,
    };
  }

  /**
   * Convierte cambios parciales a un UpdateUserRequestDto
   */
  static toPartialUpdateRequest(changes: {
    email?: string;
    username?: string;
    displayName?: string;
    avatarAssetId?: string;
  }): UpdateUserRequestDto {
    return {
      email: changes.email,
      username: changes.username,
      display_name: changes.displayName,
      avatar_asset_id: changes.avatarAssetId,
    };
  }

  /**
   * Convierte un usuario simple del API (usado en nested objects)
   */
  static fromSimpleDto(dto: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
    avatar?: string;
    avatar_asset_id?: string;
    verified?: boolean;
  }): User {
    return new User({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      displayName: dto.display_name,
      avatar: dto.avatar,
      avatarAssetId: dto.avatar_asset_id,
      verified: dto.verified ?? false,
      createdAt: new Date(), // No disponible en simple DTO
      updatedAt: new Date(),
    });
  }
}
