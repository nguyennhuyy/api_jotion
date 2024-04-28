import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Post('login')
  async login(@Body() userLogin: LoginDto) {
    return this.admin.login(userLogin);
  }

  @Post('register')
  async register(@Body() userRegister: RegisterDto) {
    return this.admin.register(userRegister);
  }

  @UseGuards(AdminGuard)
  @Get('revenue')
  async revenue() {
    return this.admin.revenue();
  }

  @UseGuards(AdminGuard)
  @Get('user/list')
  async getAllUser() {
    return this.admin.allUser();
  }

  @UseGuards(AdminGuard)
  @Get('docs/list')
  async getAllDocument() {
    return this.admin.allDocuments();
  }

  @UseGuards(AdminGuard)
  @Delete('docs/delete/:id')
  async deleteDocument(@Param('id') id: string) {
    console.log('>>>>id', id);
    return this.admin.deleteDocument(id);
  }

  @UseGuards(AdminGuard)
  @Get('workspace/list')
  async getAllWorkSpace() {
    return this.admin.allWorkSpace();
  }

  @UseGuards(AdminGuard)
  @Delete('workspace/delete/:id')
  async deleteWorkSpace(@Param('id') id: string) {
    return this.admin.deleteWorkSpace(id);
  }
}
