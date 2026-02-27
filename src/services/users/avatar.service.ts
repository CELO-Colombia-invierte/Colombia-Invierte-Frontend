import { authService } from '../auth';
import { UserMapper } from '@/mappers/UserMapper';
import { UserDto } from '@/dtos/auth/AuthResponse.dto';
import { User } from '@/models/User.model';

class AvatarService {
    async uploadAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('file', file);

        const baseUrl = import.meta.env.VITE_API_URL || '';
        const token = authService.getToken();

        const response = await fetch(`${baseUrl}/me/avatar`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            let message = response.statusText;
            try {
                const body = await response.json();
                if (body?.message) {
                    message = Array.isArray(body.message)
                        ? body.message.join(', ')
                        : body.message;
                }
            } catch {
            }
            throw new Error(message);
        }

        const data: UserDto = await response.json();
        return UserMapper.fromDto(data);
    }
}

export const avatarService = new AvatarService();
