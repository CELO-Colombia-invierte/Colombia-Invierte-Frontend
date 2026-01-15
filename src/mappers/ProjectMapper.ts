import { Project } from '@/models/Project.model';
import { ProjectDto } from '@/dtos/projects';

/**
 * ProjectMapper - Transforma entre DTOs del API y Models del dominio
 */
export class ProjectMapper {
  /**
   * Convierte ProjectDto del API a Project Model
   */
  static fromDto(dto: ProjectDto): Project {
    return new Project({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      visibility: dto.visibility,
      category: dto.category,
      coverAssetId: dto.cover_asset_id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      natilleraDetails: dto.natillera_details
        ? {
            cuotaMensual: dto.natillera_details.cuota_mensual,
            rendimientoAnual: dto.natillera_details.rendimiento_anual,
            duracionMeses: dto.natillera_details.duracion_meses,
          }
        : undefined,
      tokenizationDetails: dto.tokenization_details
        ? {
            assetValue: dto.tokenization_details.asset_value,
            tokenPrice: dto.tokenization_details.token_price,
            totalSupply: dto.tokenization_details.total_supply,
          }
        : undefined,
    });
  }

  /**
   * Convierte un array de ProjectDto a Project Models
   */
  static fromDtoArray(dtos: ProjectDto[]): Project[] {
    return dtos.map(dto => this.fromDto(dto));
  }
}
