/* eslint-disable prettier/prettier */
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator';

export class CreateParticipanteDto {
 @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsNotEmpty({ message: 'O documento (CPF/CNPJ) é obrigatório' })
  documento: string; // Certifique-se que o campo existe no Prisma Schema

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
  @IsDateString({}, { each: true }) // Valida se cada item do array é uma data ISO válida
  diasPresenca: string[];
}
