import { User } from '@/models/User.model';
import {
  UserDto,
  AuthResponseDto,
  UpdateUserRequestDto
} from '@/dtos/auth/AuthResponse.dto';

export class UserMapper {
  static fromDto(dto: UserDto): User {
    return new User({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      displayName: dto.display_name,
      avatar: dto.avatar_asset?.url || dto.avatar,
      avatarAssetId: dto.avatar_asset_id,
      verified: dto.verified ?? dto.is_verified ?? false,
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
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }


  static fromAuthResponse(dto: AuthResponseDto): User {
    return this.fromDto(dto.user);
  }

  static toUpdateRequest(user: User): UpdateUserRequestDto {
    return {
      email: user.email,
      username: user.username,
      display_name: user.displayName,
      avatar_asset_id: user.avatarAssetId,
      phone: user.phone,
      phone_country_code: user.phoneCountryCode,
      date_of_birth: user.dateOfBirth,
      gender: user.gender,
      investment_experience: user.investmentExperience,
      employment_status: user.employmentStatus,
      investment_expertise: user.investmentExpertise,
      investment_timeline: user.investmentTimeline,
      risk_tolerance: user.riskTolerance,
      favorite_categories: user.favoriteCategories,
      active_interests: user.activeInterests,
    };
  }

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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
