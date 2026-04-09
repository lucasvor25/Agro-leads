import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize-html.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
