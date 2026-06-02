import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Rareza } from '@prisma/client';

export class CrearCartaDto {
  @IsString()
  nombre: string;

  @IsString()
  personaje: string;

  @IsString()
  serie: string;

  @IsEnum(Rareza)
  rareza: Rareza;

  @IsUrl()
  imagenUrl: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  limitada?: boolean;

  @IsString()
  @IsOptional()
  albumId?: string;

  @IsUrl()
  @IsOptional()
  imagenReversoUrl?: string;
}
