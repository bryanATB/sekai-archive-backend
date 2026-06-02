import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SobreCartaItemDto {
  @IsString()
  cartaId: string;

  @IsNumber()
  @Min(1)
  peso: number;
}

export class CrearSobreDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(1)
  costo: number;

  @IsNumber()
  @IsOptional()
  cantCartas?: number;

  @IsArray()
  @IsOptional()
  @Type(() => SobreCartaItemDto)
  cartas?: SobreCartaItemDto[];

  @IsUrl()
  @IsOptional()
  imagenUrl?: string;
}
