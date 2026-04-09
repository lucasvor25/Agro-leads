import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize-html.decorator';

export class CreateUserDto {
  @IsString({ message: 'O nome informado deve ser um texto válido' })
  @IsNotEmpty({ message: 'O campo nome não pode estar vazio' })
  @SanitizeHtml()
  name: string;

  @IsEmail({}, { message: 'O formato do e-mail informado é inválido' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio' })
  email: string;

  @IsString({ message: 'A senha informada deve ser um texto válido' })
  @MinLength(6, { message: 'Sua senha precisa ter no mínimo 6 caracteres' })
  password: string;
}
