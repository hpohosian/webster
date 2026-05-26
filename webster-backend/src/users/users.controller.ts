import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from './entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(), // в память, не на диск
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current user profile (including avatar)' })
  @ApiBody({ type: UpdateUserDto })
  async updateMe(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.session.user.id;
    const { username, bio } = req.body;

    const updateUserDto: any = {
      username,
      bio,
      hideFromAttendees: req.body.hideFromAttendees === 'true',
    };

    if (file) {
      // загружаем в Cloudinary, получаем URL
      updateUserDto.profilePicture = await this.cloudinaryService.uploadAvatar(file);
    }

    return this.usersService.updateUser(userId, updateUserDto);
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  updateUserByAdmin(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: User })
  getMe(@Req() req) {
    return this.usersService.findUserById(req.session.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
