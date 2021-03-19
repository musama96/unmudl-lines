import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/authCredentialsDto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserAuthCredentialsDto } from './dto/userAuthCredentila.dto';
import { EmployerAuthCredentialsDto } from './dto/employerAuthCredentialsDto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  login(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.login(authCredentialsDto);
  }

  @ApiOperation({ summary: 'Admin users sign in API.' })
  @ApiResponse({
    status: 200,
    description: 'Access Token will be sent back on successful login.',
  })
  @Post('user/login')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  userLogin(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.userLogin(authCredentialsDto, false);
  }

  @ApiOperation({ summary: 'College users sign in API.' })
  @ApiResponse({
    status: 200,
    description: 'Access Token will be sent back on successful login.',
  })
  @Post('college/login')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  collegeLogin(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.userLogin(authCredentialsDto, true);
  }

  @ApiOperation({ summary: 'Employer users sign in API.' })
  @ApiResponse({
    status: 200,
    description: 'Access Token will be sent back on successful login.',
  })
  @Post('employer/login')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  employerLogin(@Body() authCredentialsDto: EmployerAuthCredentialsDto) {
    return this.authService.employerLogin(authCredentialsDto);
  }

  @Post('learner/login')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  learnerLogin(@Body() authCredentialsDto: UserAuthCredentialsDto) {
    return this.authService.learnerLogin(authCredentialsDto);
  }
}
