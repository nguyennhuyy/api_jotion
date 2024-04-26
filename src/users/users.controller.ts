import { Controller, Get, Body, UseGuards, Req, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserJwtInfo } from './interfaces/common.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @UseGuards(AuthGuard)
  getInfo(@Req() req: Request & UserJwtInfo) {
    const id = req?.user?.id;
    return this.usersService.getInfo(id);
  }

  @Post('update')
  @UseGuards(AuthGuard)
  update(
    @Req() req: Request & UserJwtInfo,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const id = req?.user?.id;
    return this.usersService.update(id, updateUserDto);
  }
}
