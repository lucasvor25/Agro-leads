import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O formato do e-mail informado é inválido' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio' })
  email: string;

  @IsString({ message: 'A senha informada deve ser um texto' })
  @IsNotEmpty({ message: 'O campo senha não pode estar vazio' })
  password: string;
}
