/* eslint-disable prettier/prettier */
import {
    ArrayNotEmpty,
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';

export class CreateParticipanteDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O documento (CPF/CNPJ) é obrigatório' })
  documento: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty()
  ddd: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsNumber()
  @IsNotEmpty()
  codigoIbgeCidade: number;

  @IsString()
  @IsNotEmpty()
  profissao: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Selecione ao menos um dia de presença' })
  @IsString({ each: true })
  diasPresenca: string[];
}
